import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Google OAuth redirects here with a `code` param after sign-in.
// We exchange it for a session, then send the user on to /dashboard,
// which itself checks whether they've redeemed an invite yet.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
