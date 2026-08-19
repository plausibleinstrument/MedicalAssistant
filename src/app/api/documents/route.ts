import { createClient } from "@/lib/supabase/server";
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
  const {
    title,
    doc_type,
    doctor_name,
    document_date,
    conditions,
    summary,
    amount,
    file_path,
    file_name,
    mime_type,
  } = body;

  if (!title || !doc_type || !document_date || !file_path || !file_name) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  let doctor_id: string | null = null;

  if (doctor_name && doctor_name.trim()) {
    const trimmed = doctor_name.trim();
    const { data: existing } = await supabase
      .from("doctors")
      .select("id")
      .ilike("name", trimmed)
      .maybeSingle();

    if (existing) {
      doctor_id = existing.id;
    } else {
      const { data: created, error: createErr } = await supabase
        .from("doctors")
        .insert({ name: trimmed, created_by: user.id })
        .select("id")
        .single();
      if (createErr) {
        return NextResponse.json({ error: "Could not save doctor." }, { status: 500 });
      }
      doctor_id = created.id;
    }
  }

  const { data: document, error } = await supabase
    .from("documents")
    .insert({
      title,
      doc_type,
      doctor_id,
      document_date,
      conditions: conditions || [],
      summary: summary || null,
      amount: amount === "" || amount == null ? null : Number(amount),
      file_path,
      file_name,
      mime_type: mime_type || null,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ document });
}
