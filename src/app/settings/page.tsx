import Nav from "@/components/Nav";
import GenerateInviteForm from "@/components/GenerateInviteForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getStrings } from "@/lib/strings";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/invite");

  const { data: members } = await supabase
    .from("profiles")
    .select("email, full_name, role, created_at")
    .order("created_at", { ascending: true });
  const t = await getStrings();

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-lg font-semibold">{t.settings}</h1>

        {profile.role === "owner" ? (
          <GenerateInviteForm t={t} />
        ) : (
          <div className="card text-sm text-stone-500">{t.ownerOnly}</div>
        )}

        <div className="card">
          <h2 className="mb-3 font-medium">{t.membersWithAccess}</h2>
          <ul className="divide-y divide-stone-100">
            {members?.map((m) => (
              <li key={m.email} className="flex items-center justify-between py-2 text-sm">
                <span>{m.full_name || m.email}</span>
                <span className="text-stone-400">{m.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
