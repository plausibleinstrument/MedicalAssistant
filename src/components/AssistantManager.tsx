"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DoctorAssistant } from "@/lib/types";

export default function AssistantManager({
  doctorId,
  assistants,
}: {
  doctorId: string;
  assistants: DoctorAssistant[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/doctor-assistants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, name, phone }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not save assistant.");
      return;
    }
    setName("");
    setPhone("");
    setOpen(false);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this assistant?")) return;
    const res = await fetch(`/api/doctor-assistants/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Could not remove this assistant.");
  }

  return (
    <div className="mt-2">
      {assistants.length > 0 && (
        <ul className="space-y-1">
          {assistants.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm text-stone-500">
              <span>
                Assistant: {a.name}
                {a.phone ? ` · ${a.phone}` : ""}
              </span>
              <button
                type="button"
                className="text-xs text-red-500 hover:underline"
                onClick={() => remove(a.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <form onSubmit={add} className="mt-2 flex flex-wrap items-end gap-2">
          <div>
            <label className="label">Assistant name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <button className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="mt-1 text-xs text-brand-700 hover:underline"
          onClick={() => setOpen(true)}
        >
          + Add assistant
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
