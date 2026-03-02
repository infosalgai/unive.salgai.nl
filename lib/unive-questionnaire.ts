/**
 * Univé Vragenlijst Melkveehouders – answer schema and mapping to summary input.
 * Stable keys (q1, q2_cows, …) for form state and API.
 */

export interface UniveFormData {
  q1: string
  q1_anders: string
  q2_cows: number
  q2_hectares: number
  q3: string
  q4: number
  q5: string
  q6: string[]
  q6_anders: string
  q7: number
  q8: string
  q8a: string
  q9: string[]
  q9_anders: string
  q10: string
  q11: number
  q11_toelichting: string
  q12: string
  q13: string[]
  q13_anders: string
  q14: string[]
  q14_anders: string
  q15a: number
  q15b: string
  q16: string[]
  q16_anders: string
  q17: string[]
  q17_anders: string
  q18: number
  q18_toelichting: string
  q19: string[]
  q19_anders: string
  q20: string
  q21: string
  q22: string
  q23: string
  q_opmerkingen: string
}

export const UNIVE_INITIAL_FORM_DATA: UniveFormData = {
  q1: "",
  q1_anders: "",
  q2_cows: 0,
  q2_hectares: 0,
  q3: "",
  q4: 4,
  q5: "",
  q6: [],
  q6_anders: "",
  q7: 4,
  q8: "",
  q8a: "",
  q9: [],
  q9_anders: "",
  q10: "",
  q11: 4,
  q11_toelichting: "",
  q12: "",
  q13: [],
  q13_anders: "",
  q14: [],
  q14_anders: "",
  q15a: 4,
  q15b: "",
  q16: [],
  q16_anders: "",
  q17: [],
  q17_anders: "",
  q18: 4,
  q18_toelichting: "",
  q19: [],
  q19_anders: "",
  q20: "",
  q21: "",
  q22: "",
  q23: "",
  q_opmerkingen: "",
}

const TOTAL_QUESTIONS = 22

export { TOTAL_QUESTIONS as UNIVE_TOTAL_QUESTIONS }

/** Check if formData is Univé questionnaire (has stable keys). */
export function isUniveFormData(fd: Record<string, unknown>): fd is UniveFormData {
  return typeof (fd as UniveFormData).q1 === "string" && typeof (fd as UniveFormData).q2_cows === "number"
}

/**
 * Convert structured Univé answers to a concise Dutch narrative (no PII)
 * for the existing AI summary step. Used by /api/timeout/summarize.
 */
export function buildUniveSummaryInput(fd: UniveFormData): string {
  const lines: string[] = []

  const push = (label: string, value: unknown) => {
    if (value === undefined || value === null) return
    if (typeof value === "string" && !value.trim()) return
    if (Array.isArray(value) && value.length === 0) return
    if (typeof value === "number" && value === 0 && (label.includes("cows") || label.includes("hectares"))) return
    const s = Array.isArray(value) ? value.join(", ") : String(value).trim()
    if (s) lines.push(`${label}: ${s}`)
  }

  push("Type bedrijf", fd.q1)
  if (fd.q1 === "Anders" && fd.q1_anders) push("Type bedrijf anders", fd.q1_anders)
  if (fd.q2_cows > 0) push("Aantal melkkoeien", fd.q2_cows)
  if (fd.q2_hectares > 0) push("Aantal hectares landbouwgrond", fd.q2_hectares)
  push("Fase bedrijf", fd.q3)
  push("Toekomstvertrouwen (1–7)", fd.q4)
  push("Grootste zorgen komende 5–10 jaar", fd.q5)
  if (fd.q6.length) push("Ontwikkelingen met meeste invloed", fd.q6)
  if (fd.q6.some((x) => x.startsWith("Anders")) && fd.q6_anders) push("Ontwikkelingen anders", fd.q6_anders)
  push("Gevoel invloed op toekomst (1–7)", fd.q7)
  push("Aanpassingen afgelopen 5 jaar", fd.q8)
  if ((fd.q8 === "Ja, meerdere" || fd.q8 === "Ja, beperkt") && fd.q8a) push("Welke aanpassingen", fd.q8a)
  if (fd.q9.length) push("Aanleidingen aanpassingen", fd.q9)
  if (fd.q9.some((x) => x.startsWith("Anders")) && fd.q9_anders) push("Aanleidingen anders", fd.q9_anders)
  push("Concrete aanleiding om (opnieuw) aanpassingen te doen", fd.q10)
  push("Stabiliteit verdienmodel (1–7)", fd.q11)
  if (fd.q11_toelichting) push("Toelichting stabiliteit", fd.q11_toelichting)
  push("Grootste kwetsbaarheid verdienmodel", fd.q12)
  if (fd.q13.length) push("Financieel meest afhankelijk van", fd.q13)
  if (fd.q13.some((x) => x.startsWith("Anders")) && fd.q13_anders) push("Afhankelijk anders", fd.q13_anders)
  if (fd.q14.length) push("Ruimte om te sturen", fd.q14)
  if (fd.q14.some((x) => x.startsWith("Anders")) && fd.q14_anders) push("Ruimte anders", fd.q14_anders)
  push("Behoefte aanvullende inkomsten / risicospreiding (1–7)", fd.q15a)
  push("Mogelijkheden inkomsten verbreden", fd.q15b)
  if (fd.q16.length) push("Vormen verbreding of aanpassing", fd.q16)
  if (fd.q16.some((x) => x.startsWith("Anders")) && fd.q16_anders) push("Verbreding anders", fd.q16_anders)
  if (fd.q17.length) push("Wat houdt tegen om aanpassingen te doen", fd.q17)
  if (fd.q17.some((x) => x.startsWith("Anders")) && fd.q17_anders) push("Houdt tegen anders", fd.q17_anders)
  push("Rol financiering in afweging veranderen (1–7)", fd.q18)
  if (fd.q18_toelichting) push("Toelichting financiering", fd.q18_toelichting)
  if (fd.q19.length) push("Meest waardevolle ondersteuning", fd.q19)
  if (fd.q19.some((x) => x.startsWith("Anders")) && fd.q19_anders) push("Ondersteuning anders", fd.q19_anders)
  push("Voorwaarden houtwallen", fd.q20)
  push("Voorwaarden bomen met productie", fd.q21)
  push("Liefst aanpassen aan bedrijfsvoering", fd.q22)
  push("Wat partijen moeten begrijpen van praktijk op erf", fd.q23)
  if (fd.q_opmerkingen) push("Aanvullende opmerkingen", fd.q_opmerkingen)

  return lines.join("\n")
}
