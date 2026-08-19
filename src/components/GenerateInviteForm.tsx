"use client";

import { useState } from "react";

export default function GenerateInviteForm() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setCode(null);
    const res = await fetch("/api/invite/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxUses: 1, expiresInDays: 14 }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setCode(data.invite.code);
  }

  return (
    <div className="card">
      <h2 className="mb-1 font-medium">Invite a family member</h2>
      <p className="mb-3 text-sm text-stone-500">
        Generates a one-time code, valid for 14 days. Send it to your brother
        along with a link to this site — he signs in with his own Google
        account and enters the code once.
      </p>
      <button className="btn-primary" onClick={generate} disabled={loading}>
        {loading ? "Generating…" : "Generate invite code"}
      </button>
      {code && (
        <div className="mt-3 rounded-md bg-brand-50 p-3 text-sm">
          <span className="text-stone-500">Code: </span>
          <span className="font-mono font-semibold text-brand-700">{code}</span>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
