import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, ANTHROPIC_MODEL } from "@/lib/anthropic";
import { formatDocumentsForPrompt } from "@/lib/documents";
import { formatFamilyNotesForPrompt, getAuthorNames } from "@/lib/familyNotes";
import { getLang, languageInstruction } from "@/lib/strings";
import { NextResponse } from "next/server";

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

  const body = await request.json();
  const { doctorId, conditions, from, to, appointmentContext } = body as {
    doctorId?: string;
    conditions?: string[];
    from?: string;
    to?: string;
    appointmentContext?: string;
  };

  let query = supabase
    .from("documents")
    .select("*, doctors(name, specialty)")
    .order("document_date", { ascending: true });

  if (doctorId) query = query.eq("doctor_id", doctorId);
  if (conditions && conditions.length > 0) query = query.overlaps("conditions", conditions);
  if (from) query = query.gte("document_date", from);
  if (to) query = query.lte("document_date", to);

  const { data: documents, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!documents || documents.length === 0) {
    const lang = await getLang();
    return NextResponse.json({
      report:
        lang === "hi"
          ? "इन फ़िल्टर से अभी कोई रिकॉर्ड मेल नहीं खाता, इसलिए सारांश के लिए कुछ नहीं है। पहले डैशबोर्ड से कुछ दस्तावेज़ जोड़ें, या तारीख़/बीमारी के फ़िल्टर बढ़ाएँ।"
          : "No records match these filters yet, so I don't have anything to summarize. Add some documents from the Dashboard first, or widen the date range / condition filters.",
    });
  }

  const recordsText = formatDocumentsForPrompt(documents);

  let noteQuery = supabase
    .from("family_notes")
    .select("*")
    .order("created_at", { ascending: true });
  if (from) noteQuery = noteQuery.gte("created_at", from);
  if (to) noteQuery = noteQuery.lte("created_at", `${to}T23:59:59`);
  const [{ data: notes }, authorNames, lang] = await Promise.all([
    noteQuery,
    getAuthorNames(supabase),
    getLang(),
  ]);
  const notesText = formatFamilyNotesForPrompt(notes || [], authorNames);

  const systemPrompt = `You are helping a family member prepare for an upcoming doctor's appointment for their elderly father, whose case is complex: he has cancer, ulcerative colitis (UC), diabetes, and chronic kidney disease (CKD), all being managed concurrently across multiple specialists.

${languageInstruction(lang)}

You will be given a chronological list of his medical records (bills, prescriptions, test reports, doctor's notes, discharge summaries) with short summaries that a family member typed in — not full lab data — plus a separate log of informal notes family members have left for each other (observations, phone calls with the clinic, things Dad mentioned). Work only from what's given; do not invent lab values, diagnoses, or medication details that aren't present. Treat the family notes as color and context, not clinical fact — they haven't been verified by a doctor.

Structure your response in this order, using markdown headers:
1. **Timeline since the last relevant record** — what's changed, in date order.
2. **Trends worth flagging** — only mention a trend if the summaries actually contain comparable data points across visits (e.g. two creatinine readings). If there isn't enough data for a condition, say so explicitly rather than guessing.
3. **Current medications mentioned in these records** — a plain list, noting the source document and date for each, since medication lists in real life go stale.
4. **Worth mentioning from family notes** — anything from the family notes log that's relevant to this appointment (a symptom mentioned at home, a call with the clinic) and not already captured in the formal records. Omit this section if nothing in the notes is relevant.
5. **Questions worth asking this doctor** — informed by gaps (things mentioned once and never followed up on), overlaps between specialists worth reconciling, family-reported observations worth raising, and anything not yet explained.
6. A short closing line: this is an organizing tool built from the family's own notes, not medical advice — the doctor makes the clinical calls.

Keep it concise and scannable — this will be read on a phone in a waiting room.`;

  const userPrompt = `${appointmentContext ? `Context for this specific appointment: ${appointmentContext}\n\n` : ""}Here are the matching records, oldest first:\n\n${recordsText}\n\n---\n\nFamily notes from the same period:\n\n${notesText}`;

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const report = textBlock && "text" in textBlock ? textBlock.text : "Could not generate a report.";

    return NextResponse.json({ report, recordCount: documents.length });
  } catch (err) {
    console.error("prep error", err);
    return NextResponse.json({ error: "Could not generate the prep report." }, { status: 500 });
  }
}
