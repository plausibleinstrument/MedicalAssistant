"use client";

import { useState, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  async function autoClassify(f: File) {
    setExtracting(true);
    setError(null);
    try {
      const base64 = await fileToBase64(f);
      const res = await fetch("/api/documents/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mimeType: f.type }),
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
      setError(e.message || "Could not auto-classify this file. Fill the fields in manually.");
    } finally {
      setExtracting(false);
    }
  }

  function onFileSelected(f: File | null) {
    setFile(f);
    if (f) autoClassify(f);
  }

  function validate(): string | null {
    if (!file) return "Choose a file to upload.";
    if (!title.trim()) return "Title is required.";
    if (!doctorName.trim()) return "Doctor is required.";
    if (!date) return "Date is required.";
    if (conditions.length === 0) return "Select at least one related condition.";
    if (!summary.trim()) return "Summary is required.";
    if (docType === "bill" && !amount) return "Amount is required for a bill.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError(null);

    const selectedFile = file as File;

    try {
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-documents")
        .upload(path, selectedFile, { contentType: selectedFile.type });
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
          file_name: selectedFile.name,
          mime_type: selectedFile.type,
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
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            Choose file
          </button>
          <button type="button" className="btn-secondary" onClick={() => cameraInputRef.current?.click()}>
            📷 Take a photo
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
        />
        {file && <p className="mt-2 text-sm text-stone-500">Selected: {file.name}</p>}
        {extracting && (
          <p className="mt-1 text-sm text-brand-600">✨ Reading document and auto-filling fields…</p>
        )}
        {file && !extracting && (
          <button type="button" className="btn-secondary mt-2" onClick={() => autoClassify(file)}>
            ✨ Re-run auto-fill
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
            required
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
          <label className="label">Amount{docType === "bill" ? "" : " (if a bill)"}</label>
          <input
            type="number"
            step="0.01"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required={docType === "bill"}
          />
        </div>
      </div>

      <div>
        <label className="label">Related condition(s) — select at least one</label>
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
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save record"}
      </button>
    </form>
  );
}
