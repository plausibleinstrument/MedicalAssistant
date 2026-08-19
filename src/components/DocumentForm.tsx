"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { docTypeLabels, conditionLabels, DocType, Condition } from "@/lib/types";
import { Strings, Lang } from "@/lib/strings";

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

// Camera photos can easily be 5-15MB, which blows past the 4.5MB request
// body limit serverless functions enforce once base64-encoded. Downscale
// and re-compress a copy just for the AI extraction call — the file that
// actually gets archived (uploaded separately, straight to storage) stays
// full quality.
function resizeImageForExtraction(
  file: File,
  t: Strings,
  maxDim = 1600,
  quality = 0.85
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error(t.couldNotProcessImage));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(t.couldNotReadImage));
    };
    img.src = url;
  });
}

const MAX_PDF_BYTES_FOR_EXTRACT = 3 * 1024 * 1024; // ~3MB raw, safely under the 4.5MB request cap once base64-encoded

export default function DocumentForm({ t, lang }: { t: Strings; lang: Lang }) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTitle, setSavedTitle] = useState<string | null>(null);

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
      let base64: string;
      let mimeType: string;

      if (f.type === "application/pdf") {
        if (f.size > MAX_PDF_BYTES_FOR_EXTRACT) {
          throw new Error(t.pdfTooLarge);
        }
        base64 = await fileToBase64(f);
        mimeType = f.type;
      } else {
        ({ base64, mimeType } = await resizeImageForExtraction(f, t));
      }

      const res = await fetch("/api/documents/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mimeType, lang }),
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        // Non-JSON body (e.g. a platform-level "Request Entity Too Large"
        // page) — fall through to the status-based message below.
      }
      if (!res.ok) {
        throw new Error(
          data.error || (res.status === 413 ? t.fileTooLargeGeneric : t.autoClassifyFailed)
        );
      }
      const s = data.suggestion;
      if (s.title) setTitle(s.title);
      if (s.doc_type) setDocType(s.doc_type);
      if (s.doctor_name) setDoctorName(s.doctor_name);
      if (s.document_date) setDate(s.document_date);
      if (Array.isArray(s.conditions)) setConditions(s.conditions);
      if (s.summary) setSummary(s.summary);
      if (s.amount != null) setAmount(String(s.amount));
    } catch (e: any) {
      setError(e.message || t.couldNotAutoClassify);
    } finally {
      setExtracting(false);
    }
  }

  function onFileSelected(f: File | null) {
    setFile(f);
    setSavedTitle(null);
    if (f) autoClassify(f);
  }

  function validate(): string | null {
    if (!file) return t.chooseFileError;
    if (!title.trim()) return t.titleRequired;
    if (!doctorName.trim()) return t.doctorRequired;
    if (!date) return t.dateRequired;
    if (conditions.length === 0) return t.conditionRequired;
    if (!summary.trim()) return t.summaryRequired;
    if (docType === "bill" && !amount) return t.amountRequiredBill;
    return null;
  }

  function resetForm() {
    setFile(null);
    setTitle("");
    setDocType("test_report");
    setDoctorName("");
    setDate("");
    setConditions([]);
    setSummary("");
    setAmount("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
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
    setSavedTitle(null);

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
      if (!res.ok) throw new Error(data.error || t.somethingWrong);

      setSavedTitle(title);
      resetForm();
      router.refresh();
    } catch (e: any) {
      setError(e.message || t.somethingWrong);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      {savedTitle && (
        <div className="flex items-center justify-between rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          <span>
            ✓ {t.savedPrefix} &quot;{savedTitle}&quot;. {t.addAnotherBelowOr}
          </span>
          <Link href="/dashboard" className="font-medium underline hover:no-underline">
            {t.viewRecords}
          </Link>
        </div>
      )}

      <div>
        <label className="label">{t.fileLabel}</label>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            {t.chooseFile}
          </button>
          <button type="button" className="btn-secondary" onClick={() => cameraInputRef.current?.click()}>
            {t.takePhoto}
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
        {file && (
          <p className="mt-2 text-sm text-stone-500">
            {t.selectedPrefix} {file.name}
          </p>
        )}
        {extracting && <p className="mt-1 text-sm text-brand-600">{t.readingDocument}</p>}
        {file && !extracting && (
          <button type="button" className="btn-secondary mt-2" onClick={() => autoClassify(file)}>
            {t.rerunAutofill}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{t.title}</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="label">{t.type}</label>
          <select
            className="input"
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
          >
            {Object.entries(docTypeLabels(lang)).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.doctor}</label>
          <input
            className="input"
            placeholder={t.doctorPlaceholder}
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">{t.date}</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">
            {t.amount}
            {docType === "bill" ? "" : t.amountIfBill}
          </label>
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
        <label className="label">{t.conditionsSelectAtLeastOne}</label>
        <div className="flex flex-wrap gap-3">
          {Object.entries(conditionLabels(lang)).map(([k, v]) => (
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
        <label className="label">{t.summaryField}</label>
        <textarea
          className="input"
          rows={3}
          placeholder={t.summaryFieldPlaceholder}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="btn-primary" disabled={saving}>
        {saving ? t.saving : t.saveRecord}
      </button>
    </form>
  );
}
