import Nav from "@/components/Nav";
import FamilyNotesView from "@/components/FamilyNotesView";
import { createClient } from "@/lib/supabase/server";
import { getAuthorNames } from "@/lib/familyNotes";
import { redirect } from "next/navigation";
import { FamilyNote } from "@/lib/types";
import { getStrings } from "@/lib/strings";

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
  const t = await getStrings();

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-lg font-semibold">{t.notes}</h1>
        <p className="mb-4 text-sm text-stone-500">{t.notesDescription}</p>
        <FamilyNotesView
          initialNotes={(notes as FamilyNote[]) || []}
          authorNames={authorNames}
          currentUserId={user.id}
          t={t}
        />
      </main>
    </div>
  );
}
