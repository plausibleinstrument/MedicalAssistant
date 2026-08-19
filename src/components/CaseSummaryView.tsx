"use client";

import { useState } from "react";
import { CaseSummary } from "@/lib/types";
import Markdown from "./Markdown";

export default function CaseSummaryView({ initialSummary }: { initialSummary: CaseSummary | null }) {
  const [summary, setSummary] = useState<CaseSummary | null>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function regenerate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/case-summary", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setSummary(data.summary);
  }

  return (
    <div className="space-y-4">
      <div className="card no-print flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          {summary
            ? `Last updated ${new Date(summary.created_at).toLocaleString()}`
            : "No summary generated yet."}
        </p>
        <button className="btn-primary" onClick={regenerate} disabled={loading}>
          {loading ? "Reviewing records…" : summary ? "Update case summary" : "Generate case summary"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {summary && (
        <div className="card">
          <div className="no-print mb-3 flex justify-end">
            <button className="btn-secondary" onClick={() => window.print()}>
              Print / save as PDF
            </button>
          </div>
          <Markdown text={summary.content} />
        </div>
      )}

      {!summary && !error && (
        <p className="py-12 text-center text-sm text-stone-400">
          Generate the first summary once you&apos;ve added some records.
        </p>
      )}
    </div>
  );
}
