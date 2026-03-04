/**
 * Univé Vragenlijst Melkveehouders – answer schema and mapping to summary input.
 * Stable keys (q1, q2_cows, …) for form state and API.
 */

export interface UniveFormData {
  // Deel 1 – Je bedrijf
  q1: string
  q1_anders: string
  q2_cows: number
  q2_hectares: number
  q3: string

  // Deel 2 – Huidige situatie en toekomstbeeld
  q4: string[] // ontwikkelingen met meeste invloed (max 3)
  q4_anders: string
  q4a: string[] // regelgeving (subvraag bij regelgeving)
  q4a_anders: string
  q5a: number // belang verduurzaming (1–7)
  q5b: number // invloed CO2-reductie (1–7)
  q5c: number // relevantie biodiversiteit (1–7)
  q5_toelichting: string
  q6: string // grootste zorgen komende 5–10 jaar
  q7: number // gevoel invloed op toekomst (1–7)

  // Deel 3 – Veranderingen in bedrijfsvoering
  q8: string
  q8a: string
  q9: string[] // aanleidingen (max 2)
  q9_anders: string
  q9_regelgeving: string
  q10: string
  q11: string[] // wat houdt tegen (max 2)
  q11_anders: string
  q11_toelichting: string

  // Deel 4 – Welke ondersteuning zou helpen?
  q12: number // legacy
  q12_financieel: number
  q12_pacht: number
  q12_co2: number
  q12_premiekorting: number
  q12_klimaatadaptie: number
  q12_biodiversiteit: number
  q13: string
  q13_financieel: number
  q13_pacht: number
  q13_co2: number
  q13_premiekorting: number
  q13_klimaatadaptie: number
  q13_biodiversiteit: number
  q14: string[]
  q14_anders: string

  // Deel 5 – Verdienmodel en kwetsbaarheden
  q15a: number // legacy
  q15a_nevenactiviteiten: number
  q15a_pacht: number
  q15a_risicospreiding: number
  q15a_verbreding: number
  q15b: string
  q15b_toelichting: string
  q16: string[] // legacy; gebruik q16_* sliders
  q16_marge: number
  q16_schuldenlast: number
  q16_continuïteit: number
  q16_stabiliteit: number
  q16_voortzetten: number
  q16_waardebehoud: number
  q16_anders: string

  // Deel 6 – Afsluiting
  q17: string
  q18: string
  q19_toestemming_contact: string
  q19_naam: string
  q19_email: string
  q19_telefoon: string
  q19_opmerkingen: string
}

export const UNIVE_INITIAL_FORM_DATA: UniveFormData = {
  // Deel 1 – Je bedrijf
  q1: "",
  q1_anders: "",
  q2_cows: 0,
  q2_hectares: 0,
  q3: "",

  // Deel 2 – Huidige situatie en toekomstbeeld
  q4: [],
  q4_anders: "",
  q4a: [],
  q4a_anders: "",
  q5a: 4,
  q5b: 4,
  q5c: 4,
  q5_toelichting: "",
  q6: "",
  q7: 4,

  // Deel 3 – Veranderingen in bedrijfsvoering
  q8: "",
  q8a: "",
  q9: [],
  q9_anders: "",
  q9_regelgeving: "",
  q10: "",
  q11: [],
  q11_anders: "",
  q11_toelichting: "",

  // Deel 4 – Welke ondersteuning zou helpen?
  q12: 4,
  q12_financieel: 4,
  q12_pacht: 4,
  q12_co2: 4,
  q12_premiekorting: 4,
  q12_klimaatadaptie: 4,
  q12_biodiversiteit: 4,
  q13: "",
  q13_financieel: 4,
  q13_pacht: 4,
  q13_co2: 4,
  q13_premiekorting: 4,
  q13_klimaatadaptie: 4,
  q13_biodiversiteit: 4,
  q14: [],
  q14_anders: "",

  // Deel 5 – Verdienmodel en kwetsbaarheden
  q15a: 4,
  q15a_nevenactiviteiten: 4,
  q15a_pacht: 4,
  q15a_risicospreiding: 4,
  q15a_verbreding: 4,
  q15b: "",
  q15b_toelichting: "",
  q16: [],
  q16_marge: 4,
  q16_schuldenlast: 4,
  q16_continuïteit: 4,
  q16_stabiliteit: 4,
  q16_voortzetten: 4,
  q16_waardebehoud: 4,
  q16_anders: "",

  // Deel 6 – Afsluiting
  q17: "",
  q18: "",
  q19_toestemming_contact: "",
  q19_naam: "",
  q19_email: "",
  q19_telefoon: "",
  q19_opmerkingen: "",
}

const TOTAL_QUESTIONS = 19

export { TOTAL_QUESTIONS as UNIVE_TOTAL_QUESTIONS }

/** Keys that must be string arrays (for localStorage/parsed JSON). */
const ARRAY_KEYS: (keyof UniveFormData)[] = ["q4", "q4a", "q9", "q11", "q14", "q16"];

/** Slider/scale fields 1–7. */
const SCALE_KEYS: (keyof UniveFormData)[] = [
  "q5a", "q5b", "q5c", "q7", "q12",
  "q12_financieel", "q12_pacht", "q12_co2", "q12_premiekorting", "q12_klimaatadaptie", "q12_biodiversiteit",
  "q13_financieel", "q13_pacht", "q13_co2", "q13_premiekorting", "q13_klimaatadaptie", "q13_biodiversiteit",
  "q15a", "q15a_nevenactiviteiten", "q15a_pacht", "q15a_risicospreiding", "q15a_verbreding",
  "q16_marge", "q16_schuldenlast", "q16_continuïteit", "q16_stabiliteit", "q16_voortzetten", "q16_waardebehoud",
];

/**
 * Normaliseert ruwe (bijv. uit localStorage) formulierdata naar geldig UniveFormData.
 * Zorgt dat ontbrekende velden, verkeerde types of oude schema's geen crashes geven.
 * Gebruik deze overal waar formData uit externe bron komt (localStorage, URL state).
 */
export function normalizeFormData(parsed: unknown): UniveFormData {
  const raw = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const base = { ...UNIVE_INITIAL_FORM_DATA };

  for (const key of Object.keys(base) as (keyof UniveFormData)[]) {
    const v = raw[key];
    if (ARRAY_KEYS.includes(key)) {
      const arr = Array.isArray(v) ? v : [];
      (base as Record<string, unknown>)[key] = arr.filter((item): item is string => typeof item === "string");
      continue;
    }
    if (SCALE_KEYS.includes(key)) {
      const n = typeof v === "number" && Number.isFinite(v) ? Math.min(7, Math.max(1, Math.round(v))) : (UNIVE_INITIAL_FORM_DATA[key] as number);
      (base as Record<string, unknown>)[key] = n;
      continue;
    }
    if (key === "q2_cows" || key === "q2_hectares") {
      const n = typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
      (base as Record<string, unknown>)[key] = n;
      continue;
    }
    // Alle overige velden zijn string
    (base as Record<string, unknown>)[key] = typeof v === "string" ? v : (UNIVE_INITIAL_FORM_DATA[key] as string);
  }

  return base as UniveFormData;
}

/** Check if formData is Univé questionnaire (has stable keys). */
export function isUniveFormData(fd: unknown): fd is UniveFormData {
  if (!fd || typeof fd !== "object") return false;
  const maybe = fd as Partial<UniveFormData>;
  return typeof maybe.q1 === "string" && typeof maybe.q2_cows === "number";
}

/**
 * Convert structured Univé answers to a concise Dutch narrative (no PII)
 * for the AI summary step. Used by /api/summarize.
 */
export function buildUniveSummaryInput(fd: UniveFormData): string {
  const lines: string[] = []

  const push = (label: string, value: unknown) => {
    if (value === undefined || value === null) return
    if (typeof value === "string" && !value.trim()) return
    if (Array.isArray(value) && value.length === 0) return
    const s = Array.isArray(value) ? value.join(", ") : String(value).trim()
    if (s) lines.push(`${label}: ${s}`)
  }

  // Deel 1 – Je bedrijf
  push("Type bedrijf", fd.q1 === "Anders" && fd.q1_anders ? fd.q1_anders : fd.q1)
  if (fd.q2_cows > 0) push("Aantal melkkoeien", fd.q2_cows)
  if (fd.q2_hectares > 0) push("Aantal hectares landbouwgrond", fd.q2_hectares)
  push("Fase bedrijf", fd.q3)

  // Deel 2 – Huidige situatie en toekomstbeeld
  const q4 = Array.isArray(fd.q4) ? fd.q4 : [];
  const q4a = Array.isArray(fd.q4a) ? fd.q4a : [];
  if (q4.length) push("Ontwikkelingen met meeste invloed", q4)
  if (q4.includes("Regelgeving") && q4a.length) push("Regelgeving met meeste invloed", q4a)
  if (q4.includes("Regelgeving") && q4a.includes("Anders") && fd.q4a_anders)
    push("Regelgeving anders", fd.q4a_anders)
  push("Belang verduurzaming voor continuïteit (1–7)", fd.q5a)
  push("Verwachte invloed CO₂-reductie komende 10 jaar (1–7)", fd.q5b)
  push("Relevantie biodiversiteit voor bedrijfsvoering (1–7)", fd.q5c)
  if (fd.q5_toelichting) push("Toelichting verduurzaming / CO₂ / biodiversiteit", fd.q5_toelichting)
  if (fd.q6) push("Grootste zorgen komende 5–10 jaar", fd.q6)
  push("Gevoel eigen invloed op toekomst (1–7)", fd.q7)

  // Deel 3 – Veranderingen in bedrijfsvoering
  push("Aanpassingen in bedrijfsvoering afgelopen 5 jaar", fd.q8)
  if (fd.q8a) push("Welke aanpassingen", fd.q8a)
  const q9 = Array.isArray(fd.q9) ? fd.q9 : [];
  const q11 = Array.isArray(fd.q11) ? fd.q11 : [];
  if (q9.length) push("Belangrijkste aanleidingen voor aanpassingen", q9)
  if (q9.includes("Anders") && fd.q9_anders) push("Aanleidingen anders", fd.q9_anders)
  if (q9.includes("Nieuwe regelgeving") && fd.q9_regelgeving) push("Welke regelgeving als aanleiding", fd.q9_regelgeving)
  if (fd.q10) push("Aanleiding om (opnieuw) aanpassingen te doen", fd.q10)
  if (q11.length) push("Wat houdt het meest tegen", q11)
  if (q11.includes("Anders") && fd.q11_anders) push("Wat houdt tegen anders", fd.q11_anders)
  if (fd.q11_toelichting) push("Toelichting wat het meest tegenhoudt", fd.q11_toelichting)

  // Deel 4 – Welke ondersteuning zou helpen?
  push("Openheid financiële ondersteuning (1–7)", fd.q12_financieel)
  push("Openheid pacht (1–7)", fd.q12_pacht)
  push("Openheid vergoeding CO₂-opvang (1–7)", fd.q12_co2)
  push("Openheid premiekorting (1–7)", fd.q12_premiekorting)
  push("Openheid klimaatadaptie (1–7)", fd.q12_klimaatadaptie)
  push("Openheid biodiversiteit (1–7)", fd.q12_biodiversiteit)
  push("Waardevol financiële ondersteuning (1–7)", fd.q13_financieel)
  push("Waardevol pacht (1–7)", fd.q13_pacht)
  push("Waardevol vergoeding CO₂-opvang (1–7)", fd.q13_co2)
  push("Waardevol premiekorting (1–7)", fd.q13_premiekorting)
  push("Waardevol klimaatadaptie (1–7)", fd.q13_klimaatadaptie)
  push("Waardevol biodiversiteit (1–7)", fd.q13_biodiversiteit)
  if (fd.q13) push("Toelichting ondersteuning", fd.q13)
  const q14 = Array.isArray(fd.q14) ? fd.q14 : [];
  if (q14.length) push("Andere modellen of verduurzamingsopties", q14)
  if (q14.includes("Anders, namelijk:") && fd.q14_anders) push("Andere verduurzamingsopties anders", fd.q14_anders)

  // Deel 5 – Verdienmodel en kwetsbaarheden
  push("Behoefte nevenactiviteiten (1–7)", fd.q15a_nevenactiviteiten)
  push("Behoefte pacht/verhuur (1–7)", fd.q15a_pacht)
  push("Behoefte risicospreiding (1–7)", fd.q15a_risicospreiding)
  push("Behoefte verbreding inkomsten (1–7)", fd.q15a_verbreding)
  push("Ervaren mogelijkheden om inkomsten te verbreden of risico's te spreiden", fd.q15b)
  if (fd.q15b_toelichting) push("Toelichting mogelijkheden verbreding / risicospreiding", fd.q15b_toelichting)
  push("Rendabel: voldoende marge (1–7)", fd.q16_marge)
  push("Rendabel: lage schuldenlast (1–7)", fd.q16_schuldenlast)
  push("Rendabel: continuïteit volgende generatie (1–7)", fd.q16_continuïteit)
  push("Rendabel: stabiliteit (1–7)", fd.q16_stabiliteit)
  push("Rendabel: bedrijf voortzetten (1–7)", fd.q16_voortzetten)
  push("Rendabel: waardebehoud (1–7)", fd.q16_waardebehoud)
  if (fd.q16_anders) push("Rendabel ondernemen anders", fd.q16_anders)

  // Deel 6 – Afsluiting (geen PII opnemen)
  if (fd.q17) push("Vrije wens voor aanpassing in bedrijfsvoering", fd.q17)
  if (fd.q18) push("Wat verzekeraars beter moeten begrijpen van de praktijk", fd.q18)
  if (fd.q19_opmerkingen) push("Aanvullende opmerkingen", fd.q19_opmerkingen)

  return lines.join("\n")
}
