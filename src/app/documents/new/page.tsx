import Nav from "@/components/Nav";
import DocumentForm from "@/components/DocumentForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewDocumentPage() {
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

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-lg font-semibold">Add a document</h1>
        <DocumentForm />
      </main>
    </div>
  );
}
