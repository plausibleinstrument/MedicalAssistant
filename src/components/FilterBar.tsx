"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { docTypeLabels, conditionLabels, Doctor } from "@/lib/types";
import { Strings, Lang } from "@/lib/strings";

export default function FilterBar({ doctors, t, lang }: { doctors: Doctor[]; t: Strings; lang: Lang }) {
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
        <label className="label">{t.type}</label>
        <select
          className="input"
          defaultValue={searchParams.get("type") || ""}
          onChange={(e) => update("type", e.target.value)}
        >
          <option value="">{t.all}</option>
          {Object.entries(docTypeLabels(lang)).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">{t.doctor}</label>
        <select
          className="input"
          defaultValue={searchParams.get("doctor") || ""}
          onChange={(e) => update("doctor", e.target.value)}
        >
          <option value="">{t.all}</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">{t.condition}</label>
        <select
          className="input"
          defaultValue={searchParams.get("condition") || ""}
          onChange={(e) => update("condition", e.target.value)}
        >
          <option value="">{t.all}</option>
          {Object.entries(conditionLabels(lang)).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">{t.from}</label>
        <input
          type="date"
          className="input"
          defaultValue={searchParams.get("from") || ""}
          onChange={(e) => update("from", e.target.value)}
        />
      </div>

      <div>
        <label className="label">{t.to}</label>
        <input
          type="date"
          className="input"
          defaultValue={searchParams.get("to") || ""}
          onChange={(e) => update("to", e.target.value)}
        />
      </div>

      <div className="flex-1 min-w-[180px]">
        <label className="label">{t.search}</label>
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          className="input"
          defaultValue={searchParams.get("q") || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
          }}
          onBlur={(e) => update("q", e.target.value)}
        />
      </div>

      <button className="btn-secondary" onClick={() => router.push("/dashboard")}>
        {t.clear}
      </button>
    </div>
  );
}
