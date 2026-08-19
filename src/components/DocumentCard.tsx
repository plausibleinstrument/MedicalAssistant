import Link from "next/link";
import { DOC_TYPE_LABELS, CONDITION_LABELS, DocumentRecord } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  bill: "bg-amber-100 text-amber-800",
  prescription: "bg-blue-100 text-blue-800",
  test_report: "bg-emerald-100 text-emerald-800",
  doctors_note: "bg-purple-100 text-purple-800",
  discharge_summary: "bg-rose-100 text-rose-800",
  other: "bg-stone-100 text-stone-700",
};

export default function DocumentCard({ doc }: { doc: DocumentRecord }) {
  return (
    <Link href={`/documents/${doc.id}`} className="card block hover:border-brand-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[doc.doc_type]}`}
            >
              {DOC_TYPE_LABELS[doc.doc_type]}
            </span>
            {doc.conditions?.map((c) => (
              <span key={c} className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                {CONDITION_LABELS[c as keyof typeof CONDITION_LABELS] || c}
              </span>
            ))}
          </div>
          <h3 className="font-medium text-stone-900">{doc.title}</h3>
          {doc.summary && (
            <p className="mt-1 line-clamp-2 text-sm text-stone-500">{doc.summary}</p>
          )}
        </div>
        <div className="shrink-0 text-right text-sm text-stone-500">
          <div>{new Date(doc.document_date).toLocaleDateString()}</div>
          {doc.doctors?.name && <div className="text-stone-400">{doc.doctors.name}</div>}
          {doc.amount != null && (
            <div className="mt-1 font-medium text-stone-700">₹{doc.amount}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
