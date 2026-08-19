import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, ANTHROPIC_MODEL } from "@/lib/anthropic";
import { formatDocumentsForPrompt } from "@/lib/documents";
import { NextResponse } from "next/server";

const HISTORY_LIMIT = 40;

function systemPrompt(caseSummary: string | null, recordsText: string) {
  return `You answer a family's questions about their elderly father's medical case. He has cancer, ulcerative colitis (UC), diabetes, and chronic kidney disease (CKD), managed concurrently across multiple specialists.

You have two sources, both built from the family's own notes rather than full clinical data — work only from what's given, and say so plainly when the records don't answer a question rather than guessing:

${caseSummary ? `Current case summary:\n\n${caseSummary}\n\n---\n\n` : "(No case summary has been generated yet.)\n\n"}Full record list, oldest first:\n\n${recordsText}

Answer conversationally and concisely. You are not a doctor and this is not medical advice — for anything clinical, say the doctor makes that call.`;
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

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ messages: messages || [] });
}

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
  const message = (body?.message as string | undefined)?.trim();
  if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const [{ data: documents, error: docsError }, { data: caseSummary }, { data: history, error: historyError }] =
    await Promise.all([
      supabase.from("documents").select("*, doctors(name, specialty)").order("document_date", { ascending: true }),
      supabase.from("case_summary").select("content").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(HISTORY_LIMIT),
    ]);

  if (docsError) return NextResponse.json({ error: docsError.message }, { status: 500 });
  if (historyError) return NextResponse.json({ error: historyError.message }, { status: 500 });

  const { data: userMessage, error: insertError } = await supabase
    .from("chat_messages")
    .insert({ role: "user", content: message, created_by: user.id })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  const recordsText =
    documents && documents.length > 0
      ? formatDocumentsForPrompt(documents)
      : "(No records have been added yet.)";

  const conversation = [...(history || [])].reverse();
  const claudeMessages = [
    ...conversation.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: message },
  ];

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1536,
      system: systemPrompt(caseSummary?.content || null, recordsText),
      messages: claudeMessages,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : null;

    if (!reply) {
      return NextResponse.json({ error: "Could not generate a reply.", userMessage }, { status: 500 });
    }

    const { data: assistantMessage, error: assistantError } = await supabase
      .from("chat_messages")
      .insert({ role: "assistant", content: reply })
      .select()
      .single();

    if (assistantError) {
      return NextResponse.json({ error: assistantError.message, userMessage }, { status: 500 });
    }

    return NextResponse.json({ userMessage, assistantMessage });
  } catch (err) {
    console.error("chat error", err);
    return NextResponse.json({ error: "Could not generate a reply.", userMessage }, { status: 500 });
  }
}
