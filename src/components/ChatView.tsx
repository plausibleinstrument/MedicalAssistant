"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/types";
import { Strings } from "@/lib/strings";
import Markdown from "./Markdown";

export default function ChatView({
  initialMessages,
  currentUserId,
  t,
}: {
  initialMessages: ChatMessage[];
  currentUserId: string;
  t: Strings;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    setLoading(true);

    const optimistic: ChatMessage = {
      id: `pending-${Date.now()}`,
      role: "user",
      content: text,
      created_by: currentUserId,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || t.somethingWrong);
      if (data.userMessage) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimistic.id),
          data.userMessage as ChatMessage,
        ]);
      }
      return;
    }

    setMessages((prev) => [
      ...prev.filter((m) => m.id !== optimistic.id),
      data.userMessage as ChatMessage,
      data.assistantMessage as ChatMessage,
    ]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="card flex h-[65vh] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="py-12 text-center text-sm text-stone-400">{t.askEmptyState}</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={
                m.role === "user"
                  ? "inline-block max-w-[85%] rounded-lg bg-brand-600 px-3 py-2 text-left text-sm text-white"
                  : "inline-block max-w-[85%] rounded-lg bg-stone-100 px-3 py-2 text-left text-sm"
              }
            >
              {m.role === "assistant" ? <Markdown text={m.content} /> : m.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-stone-400">{t.thinking}</p>}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex gap-2 border-t border-stone-200 pt-3">
        <textarea
          className="input resize-none"
          rows={2}
          placeholder={t.askPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="btn-primary self-end" onClick={send} disabled={loading || !input.trim()}>
          {t.send}
        </button>
      </div>
    </div>
  );
}
