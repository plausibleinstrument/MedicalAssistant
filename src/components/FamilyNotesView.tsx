"use client";

import { useState, useRef, useEffect } from "react";
import { FamilyNote } from "@/lib/types";
import { Strings } from "@/lib/strings";

export default function FamilyNotesView({
  initialNotes,
  authorNames,
  currentUserId,
  t,
}: {
  initialNotes: FamilyNote[];
  authorNames: Record<string, string>;
  currentUserId: string;
  t: Strings;
}) {
  const [notes, setNotes] = useState<FamilyNote[]>(initialNotes);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  function authorFor(note: FamilyNote) {
    if (note.created_by === currentUserId) return t.you;
    return (note.created_by && authorNames[note.created_by]) || t.familyMember;
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setError(null);
    setSending(true);

    const optimistic: FamilyNote = {
      id: `pending-${Date.now()}`,
      content: text,
      created_by: currentUserId,
      created_at: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, optimistic]);

    const res = await fetch("/api/family-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.error || t.somethingWrong);
      setNotes((prev) => prev.filter((n) => n.id !== optimistic.id));
      setInput(text);
      return;
    }

    setNotes((prev) => [...prev.filter((n) => n.id !== optimistic.id), data.note as FamilyNote]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="card flex h-[65vh] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {notes.length === 0 && (
          <p className="py-12 text-center text-sm text-stone-400">{t.notesEmptyState}</p>
        )}
        {notes.map((n) => (
          <div key={n.id} className="rounded-lg bg-stone-50 px-3 py-2">
            <div className="mb-0.5 flex items-baseline justify-between gap-2 text-xs text-stone-400">
              <span className="font-medium text-stone-600">{authorFor(n)}</span>
              <span>{new Date(n.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm text-stone-800">{n.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex gap-2 border-t border-stone-200 pt-3">
        <textarea
          className="input resize-none"
          rows={2}
          placeholder={t.notesPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="btn-primary self-end" onClick={send} disabled={sending || !input.trim()}>
          {t.post}
        </button>
      </div>
    </div>
  );
}
