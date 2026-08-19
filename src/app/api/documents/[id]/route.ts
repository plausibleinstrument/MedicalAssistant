import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", params.id)
    .maybeSingle();

  if (doc) {
    await supabase.storage.from("medical-documents").remove([doc.file_path]);
  }

  const { error } = await supabase.from("documents").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
