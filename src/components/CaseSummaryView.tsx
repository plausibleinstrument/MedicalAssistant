"use client";

import { useState } from "react";
import { CaseSummary } from "@/lib/types";
import { Strings } from "@/lib/strings";
import Markdown from "./Markdown";

export default function CaseSummaryView({
  initialSummary,
  t,
}: {
  initialSummary: CaseSummary | null;
  t: Strings;
}) {
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
      setError(data.error || t.somethingWrong);
      return;
    }
    setSummary(data.summary);
  }

  return (
    <div className="space-y-4">
      <div className="card no-print flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          {summary ? `${t.lastUpdated} ${new Date(summary.created_at).toLocaleString()}` : t.noSummaryYet}
        </p>
        <button className="btn-primary" onClick={regenerate} disabled={loading}>
          {loading ? t.reviewingRecords : summary ? t.updateCaseSummary : t.generateCaseSummary}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {summary && (
        <div className="card">
          <div className="no-print mb-3 flex justify-end">
            <button className="btn-secondary" onClick={() => window.print()}>
              {t.printSavePdf}
            </button>
          </div>
          <Markdown text={summary.content} />
        </div>
      )}

      {!summary && !error && (
        <p className="py-12 text-center text-sm text-stone-400">{t.generateFirstSummary}</p>
      )}
    </div>
  );
}
