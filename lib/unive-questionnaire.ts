/**
 * Univé Vragenlijst Melkveehouders – answer schema and mapping to summary input.
 * Stable keys (q1, q2_cows, …) for form state and API.
 */

export interface UniveFormData {
  // Deel 1 – Uw bedrijf
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
  q12: number // openheid voor ondersteuning (1–7)
  q13: string
  q14: string[]
  q14_anders: string

  // Deel 5 – Verdienmodel en kwetsbaarheden
  q15a: number // behoefte aanvullende inkomsten (1–7)
  q15b: string
  q15b_toelichting: string
  q16: string[]
  q16_anders: string

  // Deel 7 – Afsluiting
  q17: string
  q18: string
  q19_toestemming_contact: string
  q19_naam: string
  q19_email: string
  q19_telefoon: string
  q19_opmerkingen: string
}

export const UNIVE_INITIAL_FORM_DATA: UniveFormData = {
  // Deel 1 – Uw bedrijf
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
  q13: "",
  q14: [],
  q14_anders: "",

  // Deel 5 – Verdienmodel en kwetsbaarheden
  q15a: 4,
  q15b: "",
  q15b_toelichting: "",
  q16: [],
  q16_anders: "",

  // Deel 7 – Afsluiting
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

  // Deel 1 – Uw bedrijf
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
  push("Openheid voor ondersteuning van Univé (1–7)", fd.q12)
  if (fd.q13) push("Gewenste vormen van ondersteuning", fd.q13)
  const q14 = Array.isArray(fd.q14) ? fd.q14 : [];
  const q16 = Array.isArray(fd.q16) ? fd.q16 : [];
  if (q14.length) push("Andere modellen of verduurzamingsopties", q14)
  if (q14.includes("Anders, namelijk:") && fd.q14_anders) push("Andere verduurzamingsopties anders", fd.q14_anders)

  // Deel 5 – Verdienmodel en kwetsbaarheden
  push("Behoefte aanvullende inkomsten / risicospreiding (1–7)", fd.q15a)
  push("Ervaren mogelijkheden om inkomsten te verbreden of risico's te spreiden", fd.q15b)
  if (fd.q15b_toelichting) push("Toelichting mogelijkheden verbreding / risicospreiding", fd.q15b_toelichting)
  if (q16.length) push("Wat betekent rendabel ondernemen", q16)
  if (q16.includes("Anders, namelijk:") && fd.q16_anders) push("Rendabel ondernemen anders", fd.q16_anders)

  // Deel 7 – Afsluiting (geen PII opnemen)
  if (fd.q17) push("Vrije wens voor aanpassing in bedrijfsvoering", fd.q17)
  if (fd.q18) push("Wat verzekeraars beter moeten begrijpen van de praktijk", fd.q18)
  if (fd.q19_opmerkingen) push("Aanvullende opmerkingen", fd.q19_opmerkingen)

  return lines.join("\n")
}
