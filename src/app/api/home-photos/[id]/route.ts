import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: photo } = await supabase
    .from("home_photos")
    .select("file_path")
    .eq("id", params.id)
    .maybeSingle();

  if (photo) {
    await supabase.storage.from("home-photos").remove([photo.file_path]);
  }

  const { error } = await supabase.from("home_photos").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
