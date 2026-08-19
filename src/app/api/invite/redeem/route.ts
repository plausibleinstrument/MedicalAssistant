import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { code } = await request.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Enter an invite code." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Already a member? No-op success — lets the page redirect cleanly.
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json({ ok: true });
  }

  const { data: invite, error: inviteError } = await admin
    .from("invite_codes")
    .select("id, uses, max_uses, expires_at")
    .eq("code", code.trim())
    .maybeSingle();

  if (inviteError || !invite) {
    return NextResponse.json({ error: "Invalid invite code." }, { status: 400 });
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "This invite code has expired." }, { status: 400 });
  }

  if (invite.uses >= invite.max_uses) {
    return NextResponse.json(
      { error: "This invite code has already been used." },
      { status: 400 }
    );
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? null,
    role: "member",
  });

  if (profileError) {
    return NextResponse.json({ error: "Could not create your account." }, { status: 500 });
  }

  await admin
    .from("invite_codes")
    .update({ uses: invite.uses + 1 })
    .eq("id", invite.id);

  return NextResponse.json({ ok: true });
}
