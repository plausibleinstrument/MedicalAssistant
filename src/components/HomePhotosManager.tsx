"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { HomePhoto } from "@/lib/types";

export default function HomePhotosManager({ photos }: { photos: HomePhoto[] }) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const path = `${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("home-photos")
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;

        const res = await fetch("/api/home-photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_path: path, file_name: file.name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not save this photo.");
      }
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Could not upload photo(s).");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this photo?")) return;
    const res = await fetch(`/api/home-photos/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Could not remove this photo.");
  }

  if (!open) {
    return (
      <button
        type="button"
        className="mb-6 text-sm text-brand-700 hover:underline"
        onClick={() => setOpen(true)}
      >
        Manage home photos
      </button>
    );
  }

  return (
    <div className="card mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Home photos</h3>
        <button type="button" className="text-sm text-stone-500 hover:underline" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button type="button" className="btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        {uploading ? "Uploading…" : "+ Add photos"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {photos.length > 0 ? (
        <ul className="divide-y divide-stone-100">
          {photos.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="truncate">{p.file_name}</span>
              <button type="button" className="shrink-0 text-xs text-red-500 hover:underline" onClick={() => remove(p.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-stone-400">No photos yet — the newest four show on the Today panel.</p>
      )}
    </div>
  );
}
