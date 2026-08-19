import Nav from "@/components/Nav";
import FilterBar from "@/components/FilterBar";
import DocumentCard from "@/components/DocumentCard";
import TodayPanel, { CareTile } from "@/components/TodayPanel";
import HomePhotosManager from "@/components/HomePhotosManager";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CONDITION_LABELS,
  Condition,
  DocType,
  DOC_TYPE_LABELS,
  DocumentRecord,
  HomePhoto,
} from "@/lib/types";
import { getStrings, getLang } from "@/lib/strings";

const HOME_PHOTOS_SHOWN = 4;

const TODAY_CONDITIONS: Condition[] = ["cancer", "uc", "diabetes", "ckd"];

function greetingFor(t: Awaited<ReturnType<typeof getStrings>>) {
  const hour = Number(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false })
  );
  if (hour < 12) return t.greetingMorning;
  if (hour < 17) return t.greetingAfternoon;
  return t.greetingEvening;
}

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

  const t = await getStrings();
  const lang = await getLang();

  const { data: recentByCondition } = await supabase
    .from("documents")
    .select("document_date, doc_type, conditions")
    .overlaps("conditions", TODAY_CONDITIONS)
    .order("document_date", { ascending: false });

  const tiles: CareTile[] = TODAY_CONDITIONS.map((c) => {
    const doc = recentByCondition?.find((d) => d.conditions?.includes(c));
    const next = doc
      ? `${DOC_TYPE_LABELS[doc.doc_type as DocType]} · ${new Date(doc.document_date).toLocaleDateString(
          lang === "hi" ? "hi-IN" : "en-IN",
          { day: "numeric", month: "short" }
        )}`
      : "";
    return { label: CONDITION_LABELS[c], next };
  });

  const dateLine = `${new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  })} · ${TODAY_CONDITIONS.length} ${t.conditionsManaged}`;

  const { data: homePhotos } = await supabase
    .from("home_photos")
    .select("*")
    .order("created_at", { ascending: false });

  const displayPhotos = (
    await Promise.all(
      (homePhotos || []).slice(0, HOME_PHOTOS_SHOWN).map(async (p) => {
        const { data: signed } = await supabase.storage
          .from("home-photos")
          .createSignedUrl(p.file_path, 3600);
        return signed?.signedUrl ? { src: signed.signedUrl, alt: p.file_name } : null;
      })
    )
  ).filter((p): p is { src: string; alt: string } => p !== null);

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
        <TodayPanel
          t={t}
          lang={lang}
          greeting={greetingFor(t)}
          dateLine={dateLine}
          tiles={tiles}
          photos={displayPhotos}
        />

        <HomePhotosManager photos={(homePhotos as HomePhoto[]) || []} />

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t.records}</h1>
          <Link href="/documents/new" className="btn-primary">
            + {t.add}
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
