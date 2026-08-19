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
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "Doctor name is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("doctors")
    .insert({
      name: body.name.trim(),
      specialty: body.specialty || null,
      hospital_or_clinic: body.hospital_or_clinic || null,
      phone: body.phone || null,
      notes: body.notes || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ doctor: data });
}
