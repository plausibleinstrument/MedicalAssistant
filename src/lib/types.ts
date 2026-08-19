export type DocType =
  | "bill"
  | "prescription"
  | "test_report"
  | "doctors_note"
  | "discharge_summary"
  | "other";

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  bill: "Bill",
  prescription: "Prescription",
  test_report: "Test Report",
  doctors_note: "Doctor's Note",
  discharge_summary: "Discharge Summary",
  other: "Other",
};

export type Condition = "cancer" | "uc" | "diabetes" | "ckd" | "general";

export const CONDITION_LABELS: Record<Condition, string> = {
  cancer: "Cancer",
  uc: "Ulcerative Colitis",
  diabetes: "Diabetes",
  ckd: "CKD (Kidney)",
  general: "General",
};

export interface Doctor {
  id: string;
  name: string;
  specialty: string | null;
  hospital_or_clinic: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  doc_type: DocType;
  doctor_id: string | null;
  doctors?: Doctor | null; // populated via join
  document_date: string; // ISO date
  conditions: Condition[];
  summary: string | null;
  amount: number | null;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "owner" | "member";
  created_at: string;
}
