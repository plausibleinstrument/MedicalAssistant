"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DOC_TYPE_LABELS, CONDITION_LABELS, Doctor } from "@/lib/types";

export default function FilterBar({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="card mb-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="label">Type</label>
        <select
          className="input"
          defaultValue={searchParams.get("type") || ""}
          onChange={(e) => update("type", e.target.value)}
        >
          <option value="">All</option>
          {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Doctor</label>
        <select
          className="input"
          defaultValue={searchParams.get("doctor") || ""}
          onChange={(e) => update("doctor", e.target.value)}
        >
          <option value="">All</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Condition</label>
        <select
          className="input"
          defaultValue={searchParams.get("condition") || ""}
          onChange={(e) => update("condition", e.target.value)}
        >
          <option value="">All</option>
          {Object.entries(CONDITION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">From</label>
        <input
          type="date"
          className="input"
          defaultValue={searchParams.get("from") || ""}
          onChange={(e) => update("from", e.target.value)}
        />
      </div>

      <div>
        <label className="label">To</label>
        <input
          type="date"
          className="input"
          defaultValue={searchParams.get("to") || ""}
          onChange={(e) => update("to", e.target.value)}
        />
      </div>

      <div className="flex-1 min-w-[180px]">
        <label className="label">Search</label>
        <input
          type="text"
          placeholder="Title or summary…"
          className="input"
          defaultValue={searchParams.get("q") || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
          }}
          onBlur={(e) => update("q", e.target.value)}
        />
      </div>

      <button className="btn-secondary" onClick={() => router.push("/dashboard")}>
        Clear
      </button>
    </div>
  );
}
