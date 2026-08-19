"use client";

import { useState } from "react";
import { CONDITION_LABELS, Condition, Doctor } from "@/lib/types";
import Markdown from "./Markdown";

export default function PrepView({ doctors }: { doctors: Doctor[] }) {
  const [doctorId, setDoctorId] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleCondition(c: Condition) {
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setReport(null);
    const res = await fetch("/api/prep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: doctorId || undefined,
        conditions: conditions.length ? conditions : undefined,
        from: from || undefined,
        to: to || undefined,
        appointmentContext: context || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setReport(data.report);
  }

  return (
    <div className="space-y-4">
      <div className="card no-print space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Upcoming appointment with</label>
            <select className="input" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">Any doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Extra context (optional)</label>
            <input
              className="input"
              placeholder="e.g. follow-up on last week's ER visit"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <div>
            <label className="label">From</label>
            <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Relevant condition(s)</label>
          <div className="flex flex-wrap gap-3">
            {Object.entries(CONDITION_LABELS).map(([k, v]) => (
              <label key={k} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={conditions.includes(k as Condition)}
                  onChange={() => toggleCondition(k as Condition)}
                />
                {v}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="btn-primary" onClick={generate} disabled={loading}>
          {loading ? "Reviewing records…" : "Prepare summary"}
        </button>
      </div>

      {report && (
        <div className="card">
          <div className="no-print mb-3 flex justify-end">
            <button className="btn-secondary" onClick={() => window.print()}>
              Print / save as PDF
            </button>
          </div>
          <Markdown text={report} />
        </div>
      )}
    </div>
  );
}
