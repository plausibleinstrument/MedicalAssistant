import type { Lang } from "@/lib/strings";

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

export const DOC_TYPE_LABELS_HI: Record<DocType, string> = {
  bill: "बिल",
  prescription: "नुस्खा",
  test_report: "जांच रिपोर्ट",
  doctors_note: "डॉक्टर का नोट",
  discharge_summary: "डिस्चार्ज सारांश",
  other: "अन्य",
};

export function docTypeLabels(lang: Lang): Record<DocType, string> {
  return lang === "hi" ? DOC_TYPE_LABELS_HI : DOC_TYPE_LABELS;
}

export type Condition = "cancer" | "uc" | "diabetes" | "ckd" | "general";

export const CONDITION_LABELS: Record<Condition, string> = {
  cancer: "Cancer",
  uc: "Ulcerative Colitis",
  diabetes: "Diabetes",
  ckd: "CKD (Kidney)",
  general: "General",
};

export const CONDITION_LABELS_HI: Record<Condition, string> = {
  cancer: "कैंसर",
  uc: "अल्सरेटिव कोलाइटिस",
  diabetes: "डायबिटीज़",
  ckd: "सीकेडी (किडनी)",
  general: "सामान्य",
};

export function conditionLabels(lang: Lang): Record<Condition, string> {
  return lang === "hi" ? CONDITION_LABELS_HI : CONDITION_LABELS;
}

export interface DoctorAssistant {
  id: string;
  doctor_id: string;
  name: string;
  phone: string | null;
  created_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string | null;
  hospital_or_clinic: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  doctor_assistants?: DoctorAssistant[]; // populated via join
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

export interface CaseSummary {
  id: string;
  content: string;
  updated_by: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_by: string | null;
  created_at: string;
}

export interface FamilyNote {
  id: string;
  content: string;
  created_by: string | null;
  created_at: string;
}

export interface HomePhoto {
  id: string;
  file_path: string;
  file_name: string;
  uploaded_by: string | null;
  created_at: string;
}
