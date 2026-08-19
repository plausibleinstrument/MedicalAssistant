import Nav from "@/components/Nav";
import CaseSummaryView from "@/components/CaseSummaryView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CaseSummary } from "@/lib/types";
import { getStrings } from "@/lib/strings";

export default async function CaseSummaryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/invite");

  const { data: summary } = await supabase
    .from("case_summary")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const t = await getStrings();

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-lg font-semibold">{t.caseSummaryTitle}</h1>
        <p className="mb-4 text-sm text-stone-500">{t.caseSummaryDescription}</p>
        <CaseSummaryView initialSummary={(summary as CaseSummary) || null} t={t} />
      </main>
    </div>
  );
}
