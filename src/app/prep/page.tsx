import Nav from "@/components/Nav";
import PrepView from "@/components/PrepView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-lg font-semibold">Prepare for a doctor visit</h1>
        <p className="mb-4 text-sm text-stone-500">
          Pulls the matching records and asks Claude to put together a timeline, trends, current
          medications, and questions worth asking — built from the notes you&apos;ve recorded, not
          a diagnosis.
        </p>
        <PrepView doctors={doctors || []} />
      </main>
    </div>
  );
}
