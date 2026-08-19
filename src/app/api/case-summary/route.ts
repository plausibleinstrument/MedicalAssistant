import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, ANTHROPIC_MODEL } from "@/lib/anthropic";
import { formatDocumentsForPrompt } from "@/lib/documents";
import { formatFamilyNotesForPrompt, getAuthorNames } from "@/lib/familyNotes";
import { getLang, languageInstruction, Lang } from "@/lib/strings";
import { NextResponse } from "next/server";

function systemPrompt(lang: Lang) {
  return `You maintain a living "state of the case" summary for an elderly father whose case is complex: he has cancer, ulcerative colitis (UC), diabetes, and chronic kidney disease (CKD), all managed concurrently across multiple specialists.

${languageInstruction(lang)}

You will be given the previous version of this summary (if one exists), the full chronological list of his medical records (bills, prescriptions, test reports, doctor's notes, discharge summaries) with short summaries a family member typed in — not full lab data — and a separate log of informal notes family members have left for each other (observations, phone calls with the clinic, things Dad mentioned). Work only from what's given; do not invent lab values, diagnoses, or medication details that aren't present. Treat the family notes as color and context, not clinical fact — they haven't been verified by a doctor, so keep them clearly distinct from the formal record.

Write an updated summary from scratch that reflects the complete current picture — don't just append to the old one. If the previous summary said something that the records no longer support or that's since changed, update or drop it rather than repeating it verbatim.

Structure your response with markdown headers:
1. **Conditions & current status** — one paragraph per condition (Cancer, UC, Diabetes, CKD) on where things stand.
2. **Care team** — doctors involved and their specialty/role, drawn from the records.
3. **Current medications** — best current understanding, noting the source document and date for each since lists go stale.
4. **Recent developments** — what's changed lately, in date order.
5. **From family notes** — relevant observations or context from the family notes log that aren't yet reflected in the formal records. Say plainly this is family-reported, not clinical documentation. Omit this section if there's nothing relevant.
6. **Open questions / things to watch** — gaps, unresolved threads, or things worth following up on.
7. A short closing line: this is an organizing summary built from the family's own notes, not a diagnosis — doctors make the clinical calls.

Keep it concise and scannable.`;
}

export async function GET() {
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

  const { data: summary } = await supabase
    .from("case_summary")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ summary: summary || null });
}

export async function POST() {
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

  const { data: documents, error: docsError } = await supabase
    .from("documents")
    .select("*, doctors(name, specialty)")
    .order("document_date", { ascending: true });

  if (docsError) {
    return NextResponse.json({ error: docsError.message }, { status: 500 });
  }

  if (!documents || documents.length === 0) {
    const lang = await getLang();
    return NextResponse.json(
      {
        error:
          lang === "hi"
            ? "सारांश बनाने के लिए अभी कोई रिकॉर्ड नहीं है। पहले डैशबोर्ड से कुछ दस्तावेज़ जोड़ें।"
            : "No records yet to summarize. Add some documents from the Dashboard first.",
      },
      { status: 400 }
    );
  }

  const { data: previous } = await supabase
    .from("case_summary")
    .select("content")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const [{ data: notes }, authorNames, lang] = await Promise.all([
    supabase.from("family_notes").select("*").order("created_at", { ascending: true }),
    getAuthorNames(supabase),
    getLang(),
  ]);

  const userPrompt = `${
    previous ? `Previous summary:\n\n${previous.content}\n\n---\n\n` : "There is no previous summary yet — this is the first one.\n\n"
  }Here are all the records on file, oldest first:\n\n${formatDocumentsForPrompt(
    documents
  )}\n\n---\n\nAll family notes on file:\n\n${formatFamilyNotesForPrompt(notes || [], authorNames)}`;

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      system: systemPrompt(lang),
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const content = textBlock && "text" in textBlock ? textBlock.text : null;

    if (!content) {
      return NextResponse.json({ error: "Could not generate a summary." }, { status: 500 });
    }

    const { data: saved, error: saveError } = await supabase
      .from("case_summary")
      .insert({ content, updated_by: user.id })
      .select()
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({ summary: saved });
  } catch (err) {
    console.error("case-summary error", err);
    return NextResponse.json({ error: "Could not generate the case summary." }, { status: 500 });
  }
}
