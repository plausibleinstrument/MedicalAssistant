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
  const doctorId = body.doctorId as string | undefined;
  const name = (body.name as string | undefined)?.trim();
  const phone = (body.phone as string | undefined)?.trim();

  if (!doctorId || !name) {
    return NextResponse.json({ error: "Doctor and assistant name are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("doctor_assistants")
    .insert({ doctor_id: doctorId, name, phone: phone || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assistant: data });
}
