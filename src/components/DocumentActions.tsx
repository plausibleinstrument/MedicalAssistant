"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Strings } from "@/lib/strings";

export default function DocumentActions({ id, t }: { id: string; t: Strings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function viewFile() {
    setLoading(true);
    const res = await fetch(`/api/documents/${id}/signed-url`);
    const data = await res.json();
    setLoading(false);
    if (res.ok) window.open(data.url, "_blank");
    else alert(data.error || t.couldNotOpenFile);
  }

  async function deleteDoc() {
    if (!confirm(t.confirmDeleteRecord)) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      alert(t.couldNotDeleteRecord);
    }
  }

  return (
    <div className="flex gap-2">
      <button className="btn-primary" onClick={viewFile} disabled={loading}>
        {loading ? t.opening : t.viewFile}
      </button>
      <button className="btn-secondary text-red-600" onClick={deleteDoc}>
        {t.delete}
      </button>
    </div>
  );
}
