"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/strings";

function readCookie(): Lang {
  if (typeof document === "undefined") return "en";
  return document.cookie.match(/(?:^|;\s*)lang=(en|hi)/)?.[1] === "hi" ? "hi" : "en";
}

export default function LangToggle() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => setLang(readCookie()), []);

  function pick(next: Lang) {
    document.cookie = `lang=${next}; path=/; max-age=31536000`;
    setLang(next);
    router.refresh();
  }

  const base = "border-2 px-3.5 py-2 text-base";
  const on = "border-brand-700 bg-brand-700 text-white";
  const off = "border-stone-300 bg-white text-stone-600 hover:border-brand-500 hover:text-brand-700";

  return (
    <div className="flex">
      <button className={`${base} ${lang === "en" ? on : off}`} onClick={() => pick("en")}>
        English
      </button>
      <button
        className={`${base} border-l-0 ${lang === "hi" ? on : off}`}
        onClick={() => pick("hi")}
      >
        हिंदी
      </button>
    </div>
  );
}
