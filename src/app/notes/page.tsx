import Nav from "@/components/Nav";
import FamilyNotesView from "@/components/FamilyNotesView";
import { createClient } from "@/lib/supabase/server";
import { getAuthorNames } from "@/lib/familyNotes";
import { redirect } from "next/navigation";
import { FamilyNote } from "@/lib/types";

export default async function NotesPage() {
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

  const { data: notes } = await supabase
    .from("family_notes")
    .select("*")
    .order("created_at", { ascending: true });
  const authorNames = await getAuthorNames(supabase);

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-lg font-semibold">Family Notes</h1>
        <p className="mb-4 text-sm text-stone-500">
          A shared space for quick notes and observations — &quot;Dad mentioned his knee
          hurts&quot;, &quot;called the clinic, they said…&quot;. Claude reads these too, and
          factors them into Prep for Visit and the Case Summary.
        </p>
        <FamilyNotesView
          initialNotes={(notes as FamilyNote[]) || []}
          authorNames={authorNames}
          currentUserId={user.id}
        />
      </main>
    </div>
  );
}
