import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, ANTHROPIC_MODEL } from "@/lib/anthropic";
import { NextResponse } from "next/server";

// Takes a base64-encoded file (image or PDF) fresh off the upload form and
// asks Claude to suggest a title, document type, doctor name, date,
// relevant condition tags, and a short summary of key values. The user
// reviews/edits every field before saving — this is a time-saver, not an
// auto-pilot.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const { base64, mimeType, lang } = await request.json();
  if (!base64 || !mimeType) {
    return NextResponse.json({ error: "Missing file data." }, { status: 400 });
  }

  const isPdf = mimeType === "application/pdf";
  // Cast to `any` here: the exact literal union types the Anthropic SDK
  // expects for `media_type` can shift between SDK versions, and this
  // shape matches the documented Messages API regardless of the SDK's
  // TS types. Runtime correctness matters more than compile-time strictness
  // for this one block.
  const contentBlock: any = isPdf
    ? {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      }
    : {
        type: "image",
        source: { type: "base64", media_type: mimeType, data: base64 },
      };

  const prompt = `This is a scanned medical document (a bill, prescription, test report, doctor's note, or discharge summary) for a patient with a complex history: cancer, ulcerative colitis (UC), diabetes, and chronic kidney disease (CKD).

This "summary" field is the ONLY thing other features in this app (doctor-visit prep, the running case summary) ever see — they never look at the original file again. If the summary drops a finding, it's gone from the app's memory even though it's sitting right there in the PDF. So do not compress this into 1-3 sentences. Many lab reports here bundle several unrelated panels on one multi-page printout (e.g. kidney function + urine + CBC + glucose + liver + thyroid all in one document) — go through every panel/section present, not just the first or most prominent one, and call out every abnormal or out-of-range value by name with its actual value, and the trend arrow/direction if a "Previous 1"/"Previous 2" column or a small chart shows earlier values. If a report explicitly states a risk classification or category (e.g. a CKD risk map, a staging grade), quote it verbatim — that's exactly the kind of line that gets missed by a short summary and matters most.

Look at the document and respond with ONLY a JSON object (no markdown fences, no other text) with these fields:
{
  "title": "short descriptive title, e.g. 'CBC + Kidney Panel'${lang === "hi" ? " — write this in Hindi (Devanagari script)" : ""}",
  "doc_type": "one of: bill, prescription, test_report, doctors_note, discharge_summary, other — always this exact English value regardless of language",
  "doctor_name": "the doctor's name if visible, or null — keep the name as written on the document, don't translate it",
  "document_date": "YYYY-MM-DD if visible, or null",
  "conditions": ["subset of: cancer, uc, diabetes, ckd, general — tag EVERY condition this document has relevant findings for, not just the most obvious one (e.g. a kidney panel bundled with a glucose test on the same report should be tagged both ckd and diabetes); use general for panels that don't map to a specific condition but are still worth tracking (CBC, LFT, thyroid, etc.) — always these exact English values regardless of language"],
  "summary": "As thorough as the document requires — for a simple single-test report, a couple of sentences is fine; for a multi-panel report, go panel by panel and name every abnormal value, its number, and its trend if shown. For prescriptions, list every medication with dose. For bills, note what it was for.${lang === "hi" ? " Write this in Hindi (Devanagari script)." : ""}",
  "amount": "a number if this is a bill with a total amount, or null"
}`;

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 3072,
      messages: [
        {
          role: "user",
          content: [contentBlock, { type: "text", text: prompt }],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
    const cleaned = raw.trim().replace(/^```json\s*|```$/g, "");
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ suggestion: parsed });
  } catch (err) {
    console.error("extract error", err);
    return NextResponse.json(
      { error: "Could not auto-classify this file. Fill the fields in manually." },
      { status: 500 }
    );
  }
}
