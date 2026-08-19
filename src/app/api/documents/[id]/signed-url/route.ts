import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", params.id)
    .maybeSingle();

  if (docError || !doc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("medical-documents")
    .createSignedUrl(doc.file_path, 300); // 5 minutes

  if (error || !data) {
    return NextResponse.json({ error: "Could not generate a link." }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
