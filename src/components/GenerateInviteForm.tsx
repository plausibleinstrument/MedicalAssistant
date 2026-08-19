"use client";

import { useState } from "react";
import { Strings } from "@/lib/strings";

export default function GenerateInviteForm({ t }: { t: Strings }) {
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
      setError(data.error || t.somethingWrong);
      return;
    }
    setCode(data.invite.code);
  }

  return (
    <div className="card">
      <h2 className="mb-1 font-medium">{t.inviteFamily}</h2>
      <p className="mb-3 text-sm text-stone-500">{t.inviteDescription}</p>
      <div className="mb-3 flex items-center gap-2">
        <label className="label mb-0" htmlFor="max-uses">
          {t.howManyCanUse}
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
        {loading ? t.generating : t.generateCode}
      </button>
      {code && (
        <div className="mt-3 rounded-md bg-brand-50 p-3 text-sm">
          <span className="text-stone-500">{t.codeLabelText} </span>
          <span className="font-mono font-semibold text-brand-700">{code}</span>
          <span className="ml-2 text-stone-400">
            ({t.worksForUpTo} {maxUses} {maxUses === 1 ? t.person : t.people})
          </span>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
