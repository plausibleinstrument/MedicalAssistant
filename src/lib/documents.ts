import { DocumentRecord } from "@/lib/types";

// Shared compact text format for feeding document records into a Claude
// prompt (used by prep, the case summary, and chat).
export function formatDocumentsForPrompt(documents: DocumentRecord[]): string {
  return documents
    .map((d) => {
      const doctorLabel = d.doctors
        ? `${d.doctors.name}${d.doctors.specialty ? ` (${d.doctors.specialty})` : ""}`
        : "unspecified doctor";
      return `- [${d.document_date}] ${d.doc_type.toUpperCase()} — ${d.title} — Doctor: ${doctorLabel} — Conditions: ${(d.conditions || []).join(", ") || "none tagged"}${d.amount != null ? ` — Amount: ${d.amount}` : ""}\n  Summary: ${d.summary || "(no summary recorded)"}`;
    })
    .join("\n");
}
