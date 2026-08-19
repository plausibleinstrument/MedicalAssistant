"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvitePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/invite/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="card w-full max-w-sm">
        <h1 className="mb-2 text-lg font-semibold text-brand-700">
          Enter your invite code
        </h1>
        <p className="mb-4 text-sm text-stone-500">
          You&apos;re signed in with Google, but this workspace is invite-only.
          Enter the code you were given to get access.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            placeholder="e.g. FAMILY-7K2M"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Checking…" : "Join"}
          </button>
        </form>
      </div>
    </div>
  );
}
