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
  const { file_path, file_name } = body as { file_path?: string; file_name?: string };
  if (!file_path || !file_name) {
    return NextResponse.json({ error: "Missing file data." }, { status: 400 });
  }

  const { data: photo, error } = await supabase
    .from("home_photos")
    .insert({ file_path, file_name, uploaded_by: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ photo });
}
