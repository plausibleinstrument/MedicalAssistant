export type Lang = "en" | "hi";

export const STRINGS = {
  en: {
    brand: "Papa's Medical Helper",
    brandSub: "Family archive",
    ask: "Ask a question",
    settings: "Settings",
    records: "Records",
    add: "Add",
    doctors: "Doctors",
    prep: "Prep for Visit",
    summary: "Case Summary",
    notes: "Family Notes",
    signOut: "Sign out",

    todayKicker: "Today",
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    conditionsManaged: "conditions being managed",
    anotherOne: "Another one",
    windowKicker: "A window from home",
    windowHint:
      "Drop in photos of home, the garden, grandchildren — whatever you want to see when you open this.",
    nothingDue: "No records yet",

    type: "Type",
    doctor: "Doctor",
    condition: "Condition",
    from: "From",
    to: "To",
    search: "Search",
    searchPlaceholder: "Title or summary…",
    clear: "Clear",
    all: "All",

    // Shared across several forms/components
    date: "Date",
    phone: "Phone",
    name: "Name",
    specialty: "Specialty",
    hospitalClinic: "Hospital / clinic",
    amount: "Amount",
    title: "Title",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    remove: "Remove",
    close: "Close",
    delete: "Delete",
    send: "Send",
    post: "Post",
    somethingWrong: "Something went wrong.",
    you: "You",
    familyMember: "Family member",
    printSavePdf: "Print / save as PDF",
    reviewingRecords: "Reviewing records…",

    // Prep for Visit
    prepTitle: "Prepare for a doctor visit",
    prepDescription:
      "Pulls the matching records and asks Claude to put together a timeline, trends, current medications, and questions worth asking — built from the notes you've recorded, not a diagnosis.",
    appointmentWith: "Upcoming appointment with",
    anyDoctor: "Any doctor",
    extraContext: "Extra context (optional)",
    extraContextPlaceholder: "e.g. follow-up on last week's ER visit",
    relevantConditions: "Relevant condition(s)",
    prepareSummary: "Prepare summary",

    // Case Summary
    caseSummaryTitle: "Case summary",
    caseSummaryDescription:
      "A living summary of Dad's case that Claude keeps up to date — conditions, care team, current medications, recent developments, and open questions. Regenerate it any time new records come in.",
    lastUpdated: "Last updated",
    noSummaryYet: "No summary generated yet.",
    updateCaseSummary: "Update case summary",
    generateCaseSummary: "Generate case summary",
    generateFirstSummary: "Generate the first summary once you've added some records.",

    // Doctors
    addDoctor: "+ Add doctor",
    assistantsLabel: "Assistant(s) — optional, add as many as needed",
    assistantNamePlaceholder: "Assistant name",
    addAssistant: "+ Add assistant",
    noDoctorsYet: "No doctors added yet.",
    assistantPrefix: "Assistant",
    confirmRemoveAssistant: "Remove this assistant?",
    couldNotSaveAssistant: "Could not save assistant.",
    couldNotRemoveAssistant: "Could not remove this assistant.",
    couldNotSaveDoctor: "Could not save doctor.",

    // Ask
    askTitle: "Ask about Dad's case",
    askDescription:
      "A shared thread the whole family can use — ask anything about his records, and Claude answers from the case summary and everything on file. Not medical advice.",
    askEmptyState:
      'Ask something like "What did the last oncology visit say?" or "Any medications that show up across multiple doctors?"',
    askPlaceholder: "Ask a question…",
    thinking: "Thinking…",

    // Family Notes
    notesDescription:
      'A shared space for quick notes and observations — "Dad mentioned his knee hurts", "called the clinic, they said…". Claude reads these too, and factors them into Prep for Visit and the Case Summary.',
    notesEmptyState:
      "No notes yet — leave one for the rest of the family, or jot down something worth remembering before the next visit.",
    notesPlaceholder: "Add a note for the family…",

    // Settings
    inviteFamily: "Invite family members",
    inviteDescription:
      "One code can be shared with multiple people — set how many below. Everyone signs in with their own Google account and enters the same code; each person only needs to do that once. The code is valid for 14 days from when you generate it.",
    howManyCanUse: "How many people can use this code",
    generateCode: "Generate invite code",
    generating: "Generating…",
    codeLabelText: "Code:",
    worksForUpTo: "works for up to",
    person: "person",
    people: "people",
    ownerOnly: "Only the workspace owner can generate invite codes.",
    membersWithAccess: "Family members with access",

    // Add a document
    addDocumentTitle: "Add a document",
    fileLabel: "File (PDF or photo)",
    chooseFile: "Choose file",
    takePhoto: "📷 Take a photo",
    selectedPrefix: "Selected:",
    readingDocument: "✨ Reading document and auto-filling fields…",
    rerunAutofill: "✨ Re-run auto-fill",
    doctorPlaceholder: "e.g. Dr. Sharma",
    amountIfBill: " (if a bill)",
    conditionsSelectAtLeastOne: "Related condition(s) — select at least one",
    summaryField: "Summary / key values",
    summaryFieldPlaceholder: "e.g. Creatinine 2.1, eGFR 32 — flagged for nephrologist follow-up",
    saveRecord: "Save record",
    savedPrefix: "Saved",
    addAnotherBelowOr: "Add another below, or",
    viewRecords: "view Records",
    chooseFileError: "Choose a file to upload.",
    titleRequired: "Title is required.",
    doctorRequired: "Doctor is required.",
    dateRequired: "Date is required.",
    conditionRequired: "Select at least one related condition.",
    summaryRequired: "Summary is required.",
    amountRequiredBill: "Amount is required for a bill.",
    pdfTooLarge:
      "This PDF is too large to auto-fill (over 3MB). Fill the fields in manually, or try a smaller/compressed scan.",
    fileTooLargeGeneric: "This file is too large to auto-fill. Try a smaller photo or PDF.",
    autoClassifyFailed: "Auto-classify failed. Fill the fields in manually.",
    couldNotAutoClassify: "Could not auto-classify this file. Fill the fields in manually.",
    couldNotProcessImage: "Could not process this image.",
    couldNotReadImage: "Could not read this image.",

    // Document detail
    relatedConditions: "Related conditions",
    fileOnly: "File",
    viewFile: "View file",
    opening: "Opening…",
    confirmDeleteRecord: "Delete this record? This cannot be undone.",
    couldNotDeleteRecord: "Could not delete this record.",
    couldNotOpenFile: "Could not open file.",

    // Home photos
    manageHomePhotos: "Manage home photos",
    homePhotosTitle: "Home photos",
    addPhotosButton: "+ Add photos",
    uploadingEllipsis: "Uploading…",
    noPhotosYetManager: "No photos yet — the newest four show on the Today panel.",
    confirmRemovePhoto: "Remove this photo?",
    couldNotUploadPhotos: "Could not upload photo(s).",
    couldNotRemovePhoto: "Could not remove this photo.",

    // Dashboard
    noRecordsMatch: "No records match these filters yet.",
    couldNotLoadRecords: "Could not load records:",
  },
  hi: {
    brand: "पापा का मेडिकल सहायक",
    brandSub: "पारिवारिक संग्रह",
    ask: "सवाल पूछें",
    settings: "सेटिंग्स",
    records: "रिकॉर्ड",
    add: "जोड़ें",
    doctors: "डॉक्टर",
    prep: "मुलाक़ात की तैयारी",
    summary: "केस सारांश",
    notes: "पारिवारिक टिप्पणियाँ",
    signOut: "साइन आउट",

    todayKicker: "आज",
    greetingMorning: "सुप्रभात",
    greetingAfternoon: "नमस्कार",
    greetingEvening: "शुभ संध्या",
    conditionsManaged: "बीमारियाँ देखी जा रही हैं",
    anotherOne: "और एक",
    windowKicker: "घर की एक खिड़की",
    windowHint: "घर, बग़ीचे, बच्चों की तस्वीरें यहाँ लगाइए — जो देखकर मन हल्का हो।",
    nothingDue: "अभी तक कोई रिकॉर्ड नहीं",

    type: "प्रकार",
    doctor: "डॉक्टर",
    condition: "बीमारी",
    from: "से",
    to: "तक",
    search: "खोजें",
    searchPlaceholder: "शीर्षक या सारांश…",
    clear: "हटाएँ",
    all: "सभी",

    date: "तारीख़",
    phone: "फ़ोन",
    name: "नाम",
    specialty: "विशेषज्ञता",
    hospitalClinic: "अस्पताल / क्लिनिक",
    amount: "राशि",
    title: "शीर्षक",
    save: "सेव करें",
    saving: "सेव हो रहा है…",
    cancel: "रद्द करें",
    remove: "हटाएँ",
    close: "बंद करें",
    delete: "मिटाएँ",
    send: "भेजें",
    post: "पोस्ट करें",
    somethingWrong: "कुछ गड़बड़ हो गई।",
    you: "आप",
    familyMember: "परिवार का सदस्य",
    printSavePdf: "प्रिंट / PDF के रूप में सेव करें",
    reviewingRecords: "रिकॉर्ड देखे जा रहे हैं…",

    prepTitle: "डॉक्टर की मुलाक़ात की तैयारी",
    prepDescription:
      "मिलते-जुलते रिकॉर्ड लेकर Claude एक समयरेखा, रुझान, वर्तमान दवाइयाँ, और पूछने लायक सवाल तैयार करता है — यह आपके नोट्स पर आधारित है, कोई निदान नहीं।",
    appointmentWith: "आगामी मुलाक़ात किसके साथ",
    anyDoctor: "कोई भी डॉक्टर",
    extraContext: "अतिरिक्त जानकारी (वैकल्पिक)",
    extraContextPlaceholder: "जैसे: पिछले हफ़्ते की ER विज़िट का फॉलो-अप",
    relevantConditions: "संबंधित बीमारी(याँ)",
    prepareSummary: "तैयारी बनाएँ",

    caseSummaryTitle: "केस सारांश",
    caseSummaryDescription:
      "पापा के केस का जीवंत सारांश जिसे Claude अद्यतित रखता है — बीमारियाँ, केयर टीम, वर्तमान दवाइयाँ, हाल की घटनाएँ, और खुले सवाल। जब भी नए रिकॉर्ड आएँ, इसे दोबारा बनाएँ।",
    lastUpdated: "अंतिम बार अपडेट किया गया",
    noSummaryYet: "अभी तक कोई सारांश नहीं बनाया गया।",
    updateCaseSummary: "केस सारांश अपडेट करें",
    generateCaseSummary: "केस सारांश बनाएँ",
    generateFirstSummary: "कुछ रिकॉर्ड जोड़ने के बाद पहला सारांश बनाएँ।",

    addDoctor: "+ डॉक्टर जोड़ें",
    assistantsLabel: "सहायक — वैकल्पिक, जितने चाहें उतने जोड़ें",
    assistantNamePlaceholder: "सहायक का नाम",
    addAssistant: "+ सहायक जोड़ें",
    noDoctorsYet: "अभी तक कोई डॉक्टर नहीं जोड़ा गया।",
    assistantPrefix: "सहायक",
    confirmRemoveAssistant: "इस सहायक को हटाएँ?",
    couldNotSaveAssistant: "सहायक सेव नहीं हो सका।",
    couldNotRemoveAssistant: "इस सहायक को हटाया नहीं जा सका।",
    couldNotSaveDoctor: "डॉक्टर सेव नहीं हो सके।",

    askTitle: "पापा के केस के बारे में पूछें",
    askDescription:
      "पूरा परिवार इस्तेमाल कर सकता है — उनके रिकॉर्ड के बारे में कुछ भी पूछें, Claude केस सारांश और सभी उपलब्ध रिकॉर्ड से जवाब देगा। यह चिकित्सा सलाह नहीं है।",
    askEmptyState:
      "कुछ ऐसा पूछें: \"पिछली ऑन्कोलॉजी विज़िट में क्या कहा गया था?\" या \"कौन सी दवाइयाँ कई डॉक्टरों में दिखती हैं?\"",
    askPlaceholder: "एक सवाल पूछें…",
    thinking: "सोचा जा रहा है…",

    notesDescription:
      "परिवार के लिए त्वरित नोट्स और अवलोकन की साझा जगह — \"पापा ने घुटने में दर्द बताया\", \"क्लिनिक को कॉल किया, उन्होंने कहा…\"। Claude भी इसे पढ़ता है और मुलाक़ात की तैयारी व केस सारांश में शामिल करता है।",
    notesEmptyState:
      "अभी तक कोई टिप्पणी नहीं — परिवार के लिए एक छोड़ें, या अगली मुलाक़ात से पहले याद रखने लायक कुछ लिखें।",
    notesPlaceholder: "परिवार के लिए एक टिप्पणी जोड़ें…",

    inviteFamily: "परिवार के सदस्यों को आमंत्रित करें",
    inviteDescription:
      "एक कोड कई लोगों के साथ साझा किया जा सकता है — नीचे संख्या तय करें। हर कोई अपने Google खाते से साइन इन करके यही कोड डालता है; हर व्यक्ति को यह सिर्फ़ एक बार करना होता है। यह कोड बनने की तारीख़ से 14 दिनों तक मान्य है।",
    howManyCanUse: "कितने लोग इस कोड का उपयोग कर सकते हैं",
    generateCode: "आमंत्रण कोड बनाएँ",
    generating: "बनाया जा रहा है…",
    codeLabelText: "कोड:",
    worksForUpTo: "अधिकतम इतने लोगों के लिए मान्य:",
    person: "व्यक्ति",
    people: "लोग",
    ownerOnly: "केवल वर्कस्पेस का मालिक आमंत्रण कोड बना सकता है।",
    membersWithAccess: "पहुँच रखने वाले परिवार के सदस्य",

    addDocumentTitle: "दस्तावेज़ जोड़ें",
    fileLabel: "फ़ाइल (PDF या फ़ोटो)",
    chooseFile: "फ़ाइल चुनें",
    takePhoto: "📷 फ़ोटो लें",
    selectedPrefix: "चयनित:",
    readingDocument: "✨ दस्तावेज़ पढ़ा जा रहा है और फ़ील्ड अपने आप भरे जा रहे हैं…",
    rerunAutofill: "✨ ऑटो-फ़िल दोबारा चलाएँ",
    doctorPlaceholder: "जैसे: डॉ. शर्मा",
    amountIfBill: " (अगर बिल है)",
    conditionsSelectAtLeastOne: "संबंधित बीमारी(याँ) — कम से कम एक चुनें",
    summaryField: "सारांश / मुख्य मान",
    summaryFieldPlaceholder: "जैसे: क्रिएटिनिन 2.1, eGFR 32 — नेफ्रोलॉजिस्ट फॉलो-अप के लिए चिह्नित",
    saveRecord: "रिकॉर्ड सेव करें",
    savedPrefix: "सेव किया गया",
    addAnotherBelowOr: "नीचे एक और जोड़ें, या",
    viewRecords: "रिकॉर्ड देखें",
    chooseFileError: "अपलोड के लिए एक फ़ाइल चुनें।",
    titleRequired: "शीर्षक ज़रूरी है।",
    doctorRequired: "डॉक्टर ज़रूरी है।",
    dateRequired: "तारीख़ ज़रूरी है।",
    conditionRequired: "कम से कम एक संबंधित बीमारी चुनें।",
    summaryRequired: "सारांश ज़रूरी है।",
    amountRequiredBill: "बिल के लिए राशि ज़रूरी है।",
    pdfTooLarge:
      "यह PDF ऑटो-फ़िल के लिए बहुत बड़ी है (3MB से अधिक)। फ़ील्ड खुद भरें, या छोटी/संपीड़ित स्कैन आज़माएँ।",
    fileTooLargeGeneric: "यह फ़ाइल ऑटो-फ़िल के लिए बहुत बड़ी है। छोटी फ़ोटो या PDF आज़माएँ।",
    autoClassifyFailed: "ऑटो-फ़िल विफल रहा। फ़ील्ड खुद भरें।",
    couldNotAutoClassify: "इस फ़ाइल को ऑटो-फ़िल नहीं किया जा सका। फ़ील्ड खुद भरें।",
    couldNotProcessImage: "इस फ़ोटो को प्रोसेस नहीं किया जा सका।",
    couldNotReadImage: "यह फ़ोटो पढ़ी नहीं जा सकी।",

    relatedConditions: "संबंधित बीमारियाँ",
    fileOnly: "फ़ाइल",
    viewFile: "फ़ाइल देखें",
    opening: "खोला जा रहा है…",
    confirmDeleteRecord: "यह रिकॉर्ड मिटाएँ? इसे वापस नहीं लाया जा सकता।",
    couldNotDeleteRecord: "यह रिकॉर्ड मिटाया नहीं जा सका।",
    couldNotOpenFile: "फ़ाइल नहीं खोली जा सकी।",

    manageHomePhotos: "घर की फ़ोटो प्रबंधित करें",
    homePhotosTitle: "घर की फ़ोटो",
    addPhotosButton: "+ फ़ोटो जोड़ें",
    uploadingEllipsis: "अपलोड हो रहा है…",
    noPhotosYetManager: "अभी तक कोई फ़ोटो नहीं — सबसे नई चार फ़ोटो टुडे पैनल में दिखेंगी।",
    confirmRemovePhoto: "यह फ़ोटो हटाएँ?",
    couldNotUploadPhotos: "फ़ोटो अपलोड नहीं हो सकीं।",
    couldNotRemovePhoto: "यह फ़ोटो हटाई नहीं जा सकी।",

    noRecordsMatch: "इन फ़िल्टर से कोई रिकॉर्ड मेल नहीं खाता।",
    couldNotLoadRecords: "रिकॉर्ड लोड नहीं हो सके:",
  },
} as const;

export type Strings = Record<keyof (typeof STRINGS)["en"], string>;

export const NOTES: Record<Lang, string[]> = {
  en: [
    "Four conditions, one family. You have been keeping every paper in order from thousands of kilometres away — that counts as care.",
    "Nothing is due today. It is allowed to be a quiet evening.",
    "A stretch without a flare is still progress, even when nothing improves on paper.",
    "You do not have to remember all of it. That is what this archive is for.",
  ],
  hi: [
    "चार बीमारियाँ, एक परिवार। हज़ारों किलोमीटर दूर से आप हर कागज़ सँभाल रहे हैं — यही सेवा है।",
    "आज कुछ बाकी नहीं है। आज की शाम शांत रह सकती है।",
    "बिना तकलीफ़ बीते दिन भी प्रगति हैं, चाहे रिपोर्ट में कुछ न बदले।",
    "सब कुछ याद रखना ज़रूरी नहीं। यही तो यह संग्रह है।",
  ],
};

/** Server components: read the language cookie set by <LangToggle />. */
export async function getStrings(): Promise<Strings> {
  const { cookies } = await import("next/headers");
  const lang = (cookies().get("lang")?.value as Lang) || "en";
  return STRINGS[lang] ?? STRINGS.en;
}

export async function getLang(): Promise<Lang> {
  const { cookies } = await import("next/headers");
  return (cookies().get("lang")?.value as Lang) || "en";
}

/** Appended to AI system prompts (prep, case summary, chat) so Claude's
 * own output follows the same language the interface is set to. */
export function languageInstruction(lang: Lang): string {
  return lang === "hi"
    ? "Respond entirely in Hindi (Devanagari script), in a warm, plain, everyday register a family member would use — not overly formal or literary Hindi. Keep drug names, lab test names, and doctor names exactly as written in the records (don't transliterate or translate them)."
    : "Respond in English.";
}
