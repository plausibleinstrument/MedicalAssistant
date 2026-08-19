import Nav from "@/components/Nav";
import FilterBar from "@/components/FilterBar";
import DocumentCard from "@/components/DocumentCard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DocumentRecord } from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
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

  let query = supabase
    .from("documents")
    .select("*, doctors(*)")
    .order("document_date", { ascending: false });

  if (searchParams.type) query = query.eq("doc_type", searchParams.type);
  if (searchParams.doctor) query = query.eq("doctor_id", searchParams.doctor);
  if (searchParams.condition) query = query.contains("conditions", [searchParams.condition]);
  if (searchParams.from) query = query.gte("document_date", searchParams.from);
  if (searchParams.to) query = query.lte("document_date", searchParams.to);
  if (searchParams.q) {
    const q = searchParams.q.replace(/[,%]/g, " ").trim();
    if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
  }

  const { data: documents, error } = await query;

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Records</h1>
          <Link href="/documents/new" className="btn-primary">
            + Add document
          </Link>
        </div>

        <FilterBar doctors={doctors || []} />

        {error && (
          <p className="text-sm text-red-600">Could not load records: {error.message}</p>
        )}

        <div className="space-y-3">
          {(documents as DocumentRecord[] | null)?.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
          {documents && documents.length === 0 && (
            <p className="py-12 text-center text-sm text-stone-400">
              No records match these filters yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
