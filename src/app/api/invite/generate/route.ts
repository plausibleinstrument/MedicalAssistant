import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  const bytes = randomBytes(6);
  let code = "";
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `FAMILY-${code}`;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "owner") {
    return NextResponse.json(
      { error: "Only the workspace owner can generate invite codes." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const maxUses = Number(body.maxUses) > 0 ? Number(body.maxUses) : 1;
  const expiresInDays = Number(body.expiresInDays) > 0 ? Number(body.expiresInDays) : 14;

  const code = generateCode();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("invite_codes")
    .insert({
      code,
      created_by: user.id,
      max_uses: maxUses,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create invite code." }, { status: 500 });
  }

  return NextResponse.json({ invite: data });
}
