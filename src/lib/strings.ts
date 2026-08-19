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
