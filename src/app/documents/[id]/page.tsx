import Nav from "@/components/Nav";
import DocumentActions from "@/components/DocumentActions";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { docTypeLabels, conditionLabels } from "@/lib/types";
import { getStrings, getLang } from "@/lib/strings";

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
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

  const { data: doc } = await supabase
    .from("documents")
    .select("*, doctors(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!doc) notFound();

  const t = await getStrings();
  const lang = await getLang();

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="card space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-semibold">{doc.title}</h1>
              <p className="text-sm text-stone-500">
                {docTypeLabels(lang)[doc.doc_type as keyof ReturnType<typeof docTypeLabels>]} ·{" "}
                {new Date(doc.document_date).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN")}
              </p>
            </div>
            <DocumentActions id={doc.id} t={t} />
          </div>

          {doc.doctors?.name && (
            <div>
              <span className="label">{t.doctor}</span>
              <p className="text-sm">{doc.doctors.name}</p>
            </div>
          )}

          {doc.conditions?.length > 0 && (
            <div>
              <span className="label">{t.relatedConditions}</span>
              <div className="flex gap-2">
                {doc.conditions.map((c: string) => (
                  <span key={c} className="rounded bg-stone-100 px-2 py-0.5 text-xs">
                    {conditionLabels(lang)[c as keyof ReturnType<typeof conditionLabels>] || c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {doc.amount != null && (
            <div>
              <span className="label">{t.amount}</span>
              <p className="text-sm">₹{doc.amount}</p>
            </div>
          )}

          {doc.summary && (
            <div>
              <span className="label">{t.summaryField}</span>
              <p className="whitespace-pre-wrap text-sm">{doc.summary}</p>
            </div>
          )}

          <div>
            <span className="label">{t.fileOnly}</span>
            <p className="text-sm text-stone-500">{doc.file_name}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
