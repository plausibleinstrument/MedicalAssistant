"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AssistantRow {
  name: string;
  phone: string;
}

export default function DoctorForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [hospital, setHospital] = useState("");
  const [phone, setPhone] = useState("");
  const [assistants, setAssistants] = useState<AssistantRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateAssistant(i: number, field: keyof AssistantRow, value: string) {
    setAssistants((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  }

  function removeAssistant(i: number) {
    setAssistants((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        specialty,
        hospital_or_clinic: hospital,
        phone,
        assistants,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not save doctor.");
      return;
    }
    setName("");
    setSpecialty("");
    setHospital("");
    setPhone("");
    setAssistants([]);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + Add doctor
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Specialty</label>
          <input className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
        </div>
        <div>
          <label className="label">Hospital / clinic</label>
          <input className="input" value={hospital} onChange={(e) => setHospital(e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Assistant(s) — optional, add as many as needed</label>
        <div className="space-y-2">
          {assistants.map((a, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                className="input flex-1"
                placeholder="Assistant name"
                value={a.name}
                onChange={(e) => updateAssistant(i, "name", e.target.value)}
              />
              <input
                className="input flex-1"
                placeholder="Phone"
                value={a.phone}
                onChange={(e) => updateAssistant(i, "phone", e.target.value)}
              />
              <button
                type="button"
                className="text-sm text-red-500 hover:underline"
                onClick={() => removeAssistant(i)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 text-sm text-brand-700 hover:underline"
          onClick={() => setAssistants((prev) => [...prev, { name: "", phone: "" }])}
        >
          + Add assistant
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
