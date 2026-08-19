"use client";

import { useState } from "react";

export default function GenerateInviteForm() {
  const [maxUses, setMaxUses] = useState(5);
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
      body: JSON.stringify({ maxUses, expiresInDays: 14 }),
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
      <h2 className="mb-1 font-medium">Invite family members</h2>
      <p className="mb-3 text-sm text-stone-500">
        One code can be shared with multiple people — set how many below. Everyone signs in with
        their own Google account and enters the same code; each person only needs to do that once.
        The code is valid for 14 days from when you generate it.
      </p>
      <div className="mb-3 flex items-center gap-2">
        <label className="label mb-0" htmlFor="max-uses">
          How many people can use this code
        </label>
        <input
          id="max-uses"
          type="number"
          min={1}
          className="input w-20"
          value={maxUses}
          onChange={(e) => setMaxUses(Math.max(1, Number(e.target.value) || 1))}
        />
      </div>
      <button className="btn-primary" onClick={generate} disabled={loading}>
        {loading ? "Generating…" : "Generate invite code"}
      </button>
      {code && (
        <div className="mt-3 rounded-md bg-brand-50 p-3 text-sm">
          <span className="text-stone-500">Code: </span>
          <span className="font-mono font-semibold text-brand-700">{code}</span>
          <span className="ml-2 text-stone-400">
            (works for up to {maxUses} {maxUses === 1 ? "person" : "people"})
          </span>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
