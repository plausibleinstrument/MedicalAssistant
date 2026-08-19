import { createClient } from "@/lib/supabase/server";
import { FamilyNote } from "@/lib/types";

// Shared helpers for feeding family_notes into a Claude prompt (used by
// prep and the case summary) alongside the formal document records.

export async function getAuthorNames(
  supabase: ReturnType<typeof createClient>
): Promise<Record<string, string>> {
  const { data } = await supabase.from("profiles").select("id, full_name, email");
  const names: Record<string, string> = {};
  (data || []).forEach((p) => {
    names[p.id] = p.full_name || p.email;
  });
  return names;
}

export function formatFamilyNotesForPrompt(
  notes: FamilyNote[],
  authorNames: Record<string, string>
): string {
  if (notes.length === 0) return "(No family notes recorded.)";
  return notes
    .map((n) => {
      const author = (n.created_by && authorNames[n.created_by]) || "a family member";
      const date = new Date(n.created_at).toISOString().slice(0, 10);
      return `- [${date}] ${author}: ${n.content}`;
    })
    .join("\n");
}
