"use client";

import { useState } from "react";
import type { Lang, Strings } from "@/lib/strings";
import { NOTES } from "@/lib/strings";

export type CareTile = {
  /** Display name of the condition, e.g. "Kidney (CKD)" */
  label: string;
  /** Plain-language status, e.g. "Test report recorded 12 Aug" */
  next: string;
};

export type CalmPhoto = { src: string; alt?: string };

/**
 * The "Today" panel: what is next for each condition, a gentle rotating note,
 * and a small photo area on the right.
 *
 * Photos: pass any image URLs you like (Supabase storage, /public, anything).
 * Leave `photos` empty and the slots render as quiet placeholders.
 */
export default function TodayPanel({
  t,
  lang,
  tiles,
  dateLine,
  greeting,
  photos = [],
}: {
  t: Strings;
  lang: Lang;
  tiles: CareTile[];
  dateLine: string;
  greeting: string;
  photos?: CalmPhoto[];
}) {
  const [i, setI] = useState(0);
  const notes = NOTES[lang];
  const note = notes[i % notes.length];
  const [hero, ...rest] = photos;

  return (
    <section className="mb-9 border-2 border-stone-900 bg-brand-50">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* Left — status */}
        <div className="border-b-2 border-stone-900 p-7 lg:border-b-0 lg:border-r-2">
          <p className="mb-1 text-[15px] font-semibold uppercase tracking-widest text-brand-500">
            {t.todayKicker}
          </p>
          <h2 className="mb-1.5 text-3xl font-bold leading-tight">{greeting}</h2>
          <p className="mb-5 text-lg text-stone-600">{dateLine}</p>

          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
            {tiles.map((c) => (
              <div
                key={c.label}
                className="flex flex-col gap-1.5 border-2 border-stone-200 bg-white px-5 py-4"
              >
                <span className="text-[17px] font-semibold">{c.label}</span>
                <span className="text-[15px] text-stone-500">{c.next || t.nothingDue}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-start gap-4 border-t-2 border-brand-100 pt-4">
            <p className="min-w-[260px] flex-1 text-xl leading-relaxed [text-wrap:pretty]">{note}</p>
            <button
              className="border-2 border-stone-300 bg-white px-4 py-3 text-[17px] text-stone-600 hover:border-brand-500 hover:text-brand-700"
              onClick={() => setI((n) => n + 1)}
            >
              {t.anotherOne}
            </button>
          </div>
        </div>

        {/* Right — photos */}
        <div className="flex flex-col gap-3.5 p-7">
          <p className="text-[15px] font-semibold uppercase tracking-widest text-brand-500">
            {t.windowKicker}
          </p>

          <div className="h-[200px] w-full overflow-hidden border-2 border-stone-200 bg-white">
            {hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero.src} alt={hero.alt || ""} className="h-full w-full object-cover" />
            ) : null}
          </div>

          <div className="grid h-[84px] grid-cols-[repeat(3,minmax(0,1fr))] gap-2.5">
            {[0, 1, 2].map((n) => (
              <div key={n} className="overflow-hidden border-2 border-stone-200 bg-white">
                {rest[n] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rest[n].src}
                    alt={rest[n].alt || ""}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            ))}
          </div>

          <p className="text-base text-stone-600 [text-wrap:pretty]">{t.windowHint}</p>
        </div>
      </div>
    </section>
  );
}
