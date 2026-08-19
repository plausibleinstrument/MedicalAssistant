import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";
import LangToggle from "./LangToggle";
import { getStrings } from "@/lib/strings";

const LINKS = [
  { href: "/dashboard", key: "records" },
  { href: "/documents/new", key: "add" },
  { href: "/doctors", key: "doctors" },
  { href: "/prep", key: "prep" },
  { href: "/case-summary", key: "summary" },
] as const;

export default async function Nav() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getStrings();

  return (
    <nav className="border-b-2 border-stone-900 bg-white">
      {/* Row 1 — brand block (never shrinks) + primary actions */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-10 px-7">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-3 py-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center bg-brand-500 text-xl font-bold text-white">
            D
          </span>
          <span className="flex flex-col leading-tight">
            <span className="whitespace-nowrap text-xl font-bold text-brand-700">{t.brand}</span>
            <span className="text-sm font-medium uppercase tracking-wider text-stone-400">
              {t.brandSub}
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-4 py-3">
          <LangToggle />
          <Link
            href="/ask"
            className="bg-brand-500 px-5 py-3 text-lg font-semibold text-white hover:bg-brand-700"
          >
            {t.ask}
          </Link>
          <Link
            href="/settings"
            className="border-2 border-stone-300 bg-white px-4 py-3 text-[17px] text-stone-600 hover:border-brand-500 hover:text-brand-700"
          >
            {t.settings}
          </Link>
        </div>
      </div>

      {/* Row 2 — page links on their own ruled row, so nothing can collide */}
      <div className="border-t border-stone-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-3.5 py-1.5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="border-b-[3px] border-transparent px-3.5 py-2.5 text-lg text-stone-700 hover:border-brand-100 hover:bg-brand-50 hover:text-brand-700"
            >
              {t[l.key]}
            </Link>
          ))}
          <span className="flex-1" />
          {user && (
            <span className="px-3.5 py-2.5 text-[15px] text-stone-400">{user.email}</span>
          )}
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
