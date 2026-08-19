import Nav from "@/components/Nav";
import PrepView from "@/components/PrepView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getStrings, getLang } from "@/lib/strings";

export default async function PrepPage() {
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

  const { data: doctors } = await supabase.from("doctors").select("*").order("name");
  const t = await getStrings();
  const lang = await getLang();

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-lg font-semibold">{t.prepTitle}</h1>
        <p className="mb-4 text-sm text-stone-500">{t.prepDescription}</p>
        <PrepView doctors={doctors || []} t={t} lang={lang} />
      </main>
    </div>
  );
}
