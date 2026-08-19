"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DOC_TYPE_LABELS, CONDITION_LABELS, DocType, Condition } from "@/lib/types";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // strip "data:...;base64," prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DocumentForm() {
  const router = useRouter();
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<DocType>("test_report");
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [summary, setSummary] = useState("");
  const [amount, setAmount] = useState("");

  function toggleCondition(c: Condition) {
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function autoClassify() {
    if (!file) return;
    setExtracting(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/documents/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mimeType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auto-classify failed.");
      const s = data.suggestion;
      if (s.title) setTitle(s.title);
      if (s.doc_type) setDocType(s.doc_type);
      if (s.doctor_name) setDoctorName(s.doctor_name);
      if (s.document_date) setDate(s.document_date);
      if (Array.isArray(s.conditions)) setConditions(s.conditions);
      if (s.summary) setSummary(s.summary);
      if (s.amount != null) setAmount(String(s.amount));
    } catch (e: any) {
      setError(e.message || "Could not auto-classify this file.");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-documents")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          doc_type: docType,
          doctor_name: doctorName,
          document_date: date,
          conditions,
          summary,
          amount,
          file_path: path,
          file_name: file.name,
          mime_type: file.type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save the record.");

      router.push("/dashboard");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label className="label">File (PDF or photo)</label>
        <input
          type="file"
          accept="application/pdf,image/*"
          className="input"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        {file && (
          <button
            type="button"
            className="btn-secondary mt-2"
            onClick={autoClassify}
            disabled={extracting}
          >
            {extracting ? "Reading document…" : "✨ Auto-fill from file with AI"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="label">Type</label>
          <select
            className="input"
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
          >
            {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Doctor</label>
          <input
            className="input"
            placeholder="e.g. Dr. Sharma"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Amount (if a bill)</label>
          <input
            type="number"
            step="0.01"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Related condition(s)</label>
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

      <div>
        <label className="label">Summary / key values</label>
        <textarea
          className="input"
          rows={3}
          placeholder="e.g. Creatinine 2.1, eGFR 32 — flagged for nephrologist follow-up"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save record"}
      </button>
    </form>
  );
}
