"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function signInWithGoogle() {
    setLoading(true);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="card w-full max-w-sm text-center">
        <h1 className="mb-2 text-xl font-semibold text-brand-700">
          Dad&apos;s Medical Records
        </h1>
        <p className="mb-6 text-sm text-stone-500">
          Private, invite-only family archive. Sign in with the Google account
          you were invited with.
        </p>
        <button
          className="btn-primary w-full"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
