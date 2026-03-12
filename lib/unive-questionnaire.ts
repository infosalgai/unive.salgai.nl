/**
 * Univé Vragenlijst Melkveehouders – answer schema and mapping to summary input.
 * Stable keys (q1, q2_cows, …) for form state and API.
 */

export interface UniveFormData {
  // Eerste vraag – geslacht (na introductie)
  q0_geslacht: string
  q0_leeftijd: string
  q0_gemeente: string

  // Deel 1 – Je bedrijf
  q1: string
  q1_anders: string
  q1_omschakeling: string
  q1_omschakeling_anders: string
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
  q10_kostenstructuur: number // invloed op kostenstructuur (1–7)
  q10_omvang: number // invloed op omvang van het bedrijf (1–7)
  q10_grondgebruik: number // invloed op grondgebruik (1–7)
  q10_samenwerking: number // invloed op samenwerking met andere partijen (1–7)
  q10_afzet: number // invloed op afzet van producten (1–7)
  q10_verbreding: number // invloed op verbreding (1–7)
  q10_anders_score: number // invloed op andere onderdelen (1–7) – niet meer in UI gebruikt
  q10_anders: string // omschrijving andere onderdelen – niet meer in UI gebruikt
  q10_toelichting: string // toelichting ervaren invloed

  // Deel 3 – Veranderingen in bedrijfsvoering
  q8: string
  q8a: string
  // Vraag 11 – matrix aanpassingen per thema (Ja/Nee + verplichte toelichting per Ja)
  q11_duurzaamheid: string // "" | "Ja" | "Nee"
  q11_duurzaamheid_toelichting: string
  q11_bedrijfsschaal: string
  q11_bedrijfsschaal_toelichting: string
  q11_bedrijfsvoering: string
  q11_bedrijfsvoering_toelichting: string
  q11_verdienmodel: string
  q11_verdienmodel_toelichting: string
  q11_investeringen: string
  q11_investeringen_toelichting: string
  q11_anders_naamelijk: string
  q11_anders_rij: string // Ja/Nee voor rij "Anders, namelijk" in matrix
  q11_anders_toelichting: string
  // Vraag 11b – aanleidingen (alleen bij ≥1 Ja bij vraag 11)
  q11b_aanleidingen: string[] // max 2
  q11b_regelgeving: string
  q11b_anders: string
  q11b_toelichting: string
  q9: string[] // legacy
  q9_anders: string
  q9_regelgeving: string
  q10: string // vraag 12 – onder welke omstandigheden (verplicht)
  q11: string[] // vraag 13 – wat houdt tegen (max 2)
  q11_anders: string
  q11_toelichting: string

  // Deel 4 – Welke ondersteuning zou helpen?
  // Vraag 14 – open voor vormen van ondersteuning (sliders 1–7 + Andere ondersteuning)
  q14_open_eenmalig: number
  q14_open_structureel: number
  q14_open_pacht: number
  q14_open_co2: number
  q14_open_premiekorting: number
  q14_open_andere: string // "" | "Ja" | "Nee"
  q14_open_andere_naamelijk: string
  q14_open_andere_score: number
  q14_open_toelichting: string
  // Vraag 15 – welke vormen ondersteuning waardevol (max 2)
  q15_waardevol: string[]
  q15_waardevol_anders: string
  q15_waardevol_toelichting: string
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
  // Vraag 16a – opties overwegen (meerdere, min 1)
  q16a: string[]
  q16a_anders: string
  // Vraag 16b – top 3 toepassen (max 3)
  q16b: string[]
  q16b_anders: string
  q14: string[]
  q14_anders: string

  // Vraag 17a – behoefte aanvullende inkomsten/risicospreiding (1 slider)
  q17a: number
  // Vraag 17b – mogelijkheden per richting (sliders 1–7 + Anders namelijk)
  q17b_directe_verkoop: number
  q17b_nieuwe_teelten: number
  q17b_co2: number
  q17b_natuur_biodiversiteit: number
  q17b_anders: string
  q17b_anders_score: number
  q17_toelichting: string // optioneel bij vraag 17

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
  q16_anders_score: number // 1–7 bij ingevulde "Anders, namelijk"
  q16_toelichting: string // optioneel bij vraag 18

  // Deel 6 – Afsluiting
  q17: string
  q18: string
  q19_toestemming_contact: string
  q19_naam: string
  q19_email: string
  q19_telefoon: string
  q19_opmerkingen: string
  q19a: string // optioneel: wat zou Univé beter moeten begrijpen van de praktijk
  q19b: string // optioneel: opmerkingen over toekomst melkveehouderij of vragenlijst

  // Vraag 21 – verloting boerenpakket (persoonsgegevens alleen voor winactie, niet gekoppeld aan antwoorden)
  q21_verloting: string // "" | "Ja" | "Nee"
  q21_email: string // e-mail voor contact bij winnen; alleen gebruikt voor de verloting
}

export const UNIVE_INITIAL_FORM_DATA: UniveFormData = {
  // Vraag 1–3 – geslacht, leeftijd, gemeente (Algemeen)
  q0_geslacht: "",
  q0_leeftijd: "",
  q0_gemeente: "",

  // Vraag 4–6 – Deel 1: Je bedrijf
  q1: "",
  q1_anders: "",
  q1_omschakeling: "",
  q1_omschakeling_anders: "",
  q2_cows: 0,
  q2_hectares: 0,
  q3: "",

  // Vraag 7–10 – Deel 2: Huidige situatie en toekomstbeeld
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
  q10_kostenstructuur: 4,
  q10_omvang: 4,
  q10_grondgebruik: 4,
  q10_samenwerking: 4,
  q10_afzet: 4,
  q10_verbreding: 4,
  q10_anders_score: 4,
  q10_anders: "",
  q10_toelichting: "",

  // Vraag 11–13 – Deel 3: Veranderingen in bedrijfsvoering
  q8: "",
  q8a: "",
  q11_duurzaamheid: "",
  q11_duurzaamheid_toelichting: "",
  q11_bedrijfsschaal: "",
  q11_bedrijfsschaal_toelichting: "",
  q11_bedrijfsvoering: "",
  q11_bedrijfsvoering_toelichting: "",
  q11_verdienmodel: "",
  q11_verdienmodel_toelichting: "",
  q11_investeringen: "",
  q11_investeringen_toelichting: "",
  q11_anders_naamelijk: "",
  q11_anders_rij: "",
  q11_anders_toelichting: "",
  q11b_aanleidingen: [],
  q11b_regelgeving: "",
  q11b_anders: "",
  q11b_toelichting: "",
  q9: [],
  q9_anders: "",
  q9_regelgeving: "",
  q10: "",
  q11: [],
  q11_anders: "",
  q11_toelichting: "",

  // Vraag 14–19 – Deel 4: Welke ondersteuning zou helpen?
  q14_open_eenmalig: 4,
  q14_open_structureel: 4,
  q14_open_pacht: 4,
  q14_open_co2: 4,
  q14_open_premiekorting: 4,
  q14_open_andere: "",
  q14_open_andere_naamelijk: "",
  q14_open_andere_score: 4,
  q14_open_toelichting: "",
  q15_waardevol: [],
  q15_waardevol_anders: "",
  q15_waardevol_toelichting: "",
  q16a: [],
  q16a_anders: "",
  q16b: [],
  q16b_anders: "",
  q17a: 4,
  q17b_directe_verkoop: 4,
  q17b_nieuwe_teelten: 4,
  q17b_co2: 4,
  q17b_natuur_biodiversiteit: 4,
  q17b_anders: "",
  q17b_anders_score: 4,
  q17_toelichting: "",

  // Legacy sliders rond ondersteuning (vraag 12–13 oud) en aanvullende opties
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
  q16_anders_score: 4,
  q16_toelichting: "",

  // Deel 6 – Afsluiting (q19a/b, contact, verloting)
  q17: "",
  q18: "",
  q19_toestemming_contact: "",
  q19_naam: "",
  q19_email: "",
  q19_telefoon: "",
  q19_opmerkingen: "",
  q19a: "",
  q19b: "",

  q21_verloting: "",
  q21_email: "",
}

const TOTAL_QUESTIONS = 21

export { TOTAL_QUESTIONS as UNIVE_TOTAL_QUESTIONS }

/** Keys that must be string arrays (for localStorage/parsed JSON). */
const ARRAY_KEYS: (keyof UniveFormData)[] = ["q4", "q4a", "q9", "q11", "q11b_aanleidingen", "q14", "q15_waardevol", "q16a", "q16b", "q16"];

/** Slider/scale fields 1–7. */
const SCALE_KEYS: (keyof UniveFormData)[] = [
  "q5a", "q5b", "q5c", "q7",
  "q10_kostenstructuur", "q10_omvang", "q10_grondgebruik", "q10_samenwerking", "q10_afzet", "q10_verbreding", "q10_anders_score",
  "q12",
  "q14_open_eenmalig", "q14_open_structureel", "q14_open_pacht", "q14_open_co2", "q14_open_premiekorting", "q14_open_andere_score",
  "q12_financieel", "q12_pacht", "q12_co2", "q12_premiekorting", "q12_klimaatadaptie", "q12_biodiversiteit",
  "q13_financieel", "q13_pacht", "q13_co2", "q13_premiekorting", "q13_klimaatadaptie", "q13_biodiversiteit",
  "q15a", "q15a_nevenactiviteiten", "q15a_pacht", "q15a_risicospreiding", "q15a_verbreding",
  "q17a", "q17b_directe_verkoop", "q17b_nieuwe_teelten", "q17b_co2", "q17b_natuur_biodiversiteit", "q17b_anders_score",
  "q16_marge", "q16_schuldenlast", "q16_continuïteit", "q16_stabiliteit", "q16_voortzetten", "q16_waardebehoud", "q16_anders_score",
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

  // Eerste vraag – geslacht
  push("Geslacht", fd.q0_geslacht)
  push("Leeftijd", fd.q0_leeftijd)
  push("Gemeente", fd.q0_gemeente)

  // Deel 1 – Je bedrijf
  push("Type bedrijf", fd.q1 === "Anders" && fd.q1_anders ? fd.q1_anders : fd.q1)
  if (fd.q1 === "In omschakeling" && fd.q1_omschakeling) {
    push("Waarnaar in omschakeling", fd.q1_omschakeling)
    if (fd.q1_omschakeling === "Anders, namelijk:" && fd.q1_omschakeling_anders) {
      push("Omschakeling anders", fd.q1_omschakeling_anders)
    }
  }
  if (fd.q2_cows > 0) push("Aantal melkkoeien", fd.q2_cows)
  if (fd.q2_hectares > 0) push("Aantal hectares landbouwgrond", fd.q2_hectares)
  push("Fase bedrijf", fd.q3)

  // Deel 2 – Huidige situatie en toekomstbeeld
  const q4 = Array.isArray(fd.q4) ? fd.q4 : [];
  const q4a = Array.isArray(fd.q4a) ? fd.q4a : [];
  if (q4.length) push("Ontwikkelingen met meeste invloed", q4)
  if (q4.includes("Regelgeving") && q4a.length) push("Regelgeving met meeste invloed", q4a)
  if (q4.includes("Regelgeving") && q4a.includes("Anders, namelijk:") && fd.q4a_anders)
    push("Regelgeving anders", fd.q4a_anders)
  push("Belang verduurzaming voor continuïteit (1–7)", fd.q5a)
  push("Verwachte invloed CO₂-reductie komende 10 jaar (1–7)", fd.q5b)
  push("Relevantie biodiversiteit voor bedrijfsvoering (1–7)", fd.q5c)
  if (fd.q5_toelichting) push("Toelichting verduurzaming / CO₂ / biodiversiteit", fd.q5_toelichting)
  if (fd.q6) push("Grootste zorgen komende 5–10 jaar", fd.q6)
  push("Invloed op kostenstructuur komende jaren (1–7)", fd.q10_kostenstructuur)
  push("Invloed op omvang van het bedrijf komende jaren (1–7)", fd.q10_omvang)
  push("Invloed op grondgebruik komende jaren (1–7)", fd.q10_grondgebruik)
  push("Invloed op samenwerking met andere partijen komende jaren (1–7)", fd.q10_samenwerking)
  push("Invloed op afzet van producten komende jaren (1–7)", fd.q10_afzet)
  push("Invloed op verbreding / nieuwe activiteiten komende jaren (1–7)", fd.q10_verbreding)
  if (fd.q10_toelichting) push("Toelichting ervaren invloed op onderdelen", fd.q10_toelichting)

  // Deel 3 – Veranderingen in bedrijfsvoering
  push("Aanpassingen in bedrijfsvoering afgelopen 5 jaar", fd.q8)
  if (fd.q8a) push("Welke aanpassingen", fd.q8a)
  if (fd.q11_duurzaamheid) push("Aanpassingen duurzaamheidsmaatregelen", fd.q11_duurzaamheid)
  if (fd.q11_duurzaamheid === "Ja" && fd.q11_duurzaamheid_toelichting) push("Toelichting duurzaamheidsmaatregelen", fd.q11_duurzaamheid_toelichting)
  if (fd.q11_bedrijfsschaal) push("Aanpassingen bedrijfsschaal", fd.q11_bedrijfsschaal)
  if (fd.q11_bedrijfsschaal === "Ja" && fd.q11_bedrijfsschaal_toelichting) push("Toelichting bedrijfsschaal", fd.q11_bedrijfsschaal_toelichting)
  if (fd.q11_bedrijfsvoering) push("Aanpassingen bedrijfsvoering", fd.q11_bedrijfsvoering)
  if (fd.q11_bedrijfsvoering === "Ja" && fd.q11_bedrijfsvoering_toelichting) push("Toelichting bedrijfsvoering", fd.q11_bedrijfsvoering_toelichting)
  if (fd.q11_verdienmodel) push("Aanpassingen verdienmodel/verbreding", fd.q11_verdienmodel)
  if (fd.q11_verdienmodel === "Ja" && fd.q11_verdienmodel_toelichting) push("Toelichting verdienmodel", fd.q11_verdienmodel_toelichting)
  if (fd.q11_investeringen) push("Aanpassingen investeringen gebouwen/stal/techniek", fd.q11_investeringen)
  if (fd.q11_investeringen === "Ja" && fd.q11_investeringen_toelichting) push("Toelichting investeringen", fd.q11_investeringen_toelichting)
  const q11b = Array.isArray(fd.q11b_aanleidingen) ? fd.q11b_aanleidingen : [];
  if (q11b.length) push("Belangrijkste aanleidingen voor aanpassingen (vraag 11b)", q11b)
  if (q11b.includes("Nieuwe regelgeving") && fd.q11b_regelgeving) push("Welke regelgeving bij aanpassingen", fd.q11b_regelgeving)
  if (q11b.includes("Anders, namelijk:") && fd.q11b_anders) push("Aanleidingen anders", fd.q11b_anders)
  if (fd.q11b_toelichting) push("Toelichting aanleidingen", fd.q11b_toelichting)
  const q9 = Array.isArray(fd.q9) ? fd.q9 : [];
  const q11 = Array.isArray(fd.q11) ? fd.q11 : [];
  if (q9.length) push("Belangrijkste aanleidingen voor aanpassingen (legacy)", q9)
  if (q9.includes("Anders") && fd.q9_anders) push("Aanleidingen anders (legacy)", fd.q9_anders)
  if (q9.includes("Nieuwe regelgeving") && fd.q9_regelgeving) push("Welke regelgeving als aanleiding", fd.q9_regelgeving)
  if (fd.q10) push("Onder welke omstandigheden toekomstige aanpassingen", fd.q10)
  if (q11.length) push("Wat houdt het meest tegen", q11)
  if (q11.includes("Anders") && fd.q11_anders) push("Wat houdt tegen anders", fd.q11_anders)
  if (fd.q11_toelichting) push("Toelichting wat het meest tegenhoudt", fd.q11_toelichting)

  // Deel 4 – Welke ondersteuning zou helpen?
  push("Open eenmalige financiële bijdrage (1–7)", fd.q14_open_eenmalig)
  push("Open structurele financiële vergoeding (1–7)", fd.q14_open_structureel)
  push("Open pachtconstructies (1–7)", fd.q14_open_pacht)
  push("Open vergoedingen CO₂-vastlegging (1–7)", fd.q14_open_co2)
  push("Open premiekorting CO₂/klimaat/biodiversiteit (1–7)", fd.q14_open_premiekorting)
  if (fd.q14_open_toelichting) push("Toelichting openheid ondersteuning vraag 14", fd.q14_open_toelichting)
  const q15w = Array.isArray(fd.q15_waardevol) ? fd.q15_waardevol : []
  if (q15w.length) push("Waardevolle vormen ondersteuning (max 2)", q15w)
  if (q15w.includes("Anders, namelijk:") && fd.q15_waardevol_anders) push("Waardevolle ondersteuning anders", fd.q15_waardevol_anders)
  if (fd.q15_waardevol_toelichting) push("Toelichting waardevolle ondersteuning vraag 15", fd.q15_waardevol_toelichting)
  const q16a = Array.isArray(fd.q16a) ? fd.q16a : []
  if (q16a.length) push("Opties overwegen landgebruik/activiteiten (vraag 16a)", q16a)
  if (q16a.includes("Anders, namelijk:") && fd.q16a_anders) push("16a anders", fd.q16a_anders)
  const q16b = Array.isArray(fd.q16b) ? fd.q16b : []
  if (q16b.length) push("Top 3 toepassen (vraag 16b)", q16b)
  if (q16b.includes("Anders, namelijk:") && fd.q16b_anders) push("16b anders", fd.q16b_anders)
  push("Behoefte aanvullende inkomsten of risicospreiding (1–7, vraag 17a)", fd.q17a)
  push("Mogelijkheden directe verkoop (1–7)", fd.q17b_directe_verkoop)
  push("Mogelijkheden nieuwe teelten (1–7)", fd.q17b_nieuwe_teelten)
  push("Mogelijkheden vergoeding CO₂-vastlegging (1–7)", fd.q17b_co2)
  push("Mogelijkheden natuur- en biodiversiteitsbeheer (1–7)", fd.q17b_natuur_biodiversiteit)
  if (fd.q17_toelichting) push("Toelichting vraag 17", fd.q17_toelichting)

  // Deel 5 – Verdienmodel en kwetsbaarheden
  push("Rendabel: voldoende marge (1–7)", fd.q16_marge)
  push("Rendabel: lage schuldenlast (1–7)", fd.q16_schuldenlast)
  push("Rendabel: continuïteit volgende generatie (1–7)", fd.q16_continuïteit)
  push("Rendabel: stabiliteit (1–7)", fd.q16_stabiliteit)
  push("Rendabel: bedrijf voortzetten (1–7)", fd.q16_voortzetten)
  push("Rendabel: waardebehoud (1–7)", fd.q16_waardebehoud)
  if (fd.q16_toelichting) push("Toelichting rendabel ondernemen (vraag 18)", fd.q16_toelichting)

  // Deel 6 – Afsluiting (geen PII opnemen)
  if (fd.q19_opmerkingen) push("Aanvullende opmerkingen", fd.q19_opmerkingen)
  if (fd.q19a) push("Wat Univé beter moet begrijpen (vraag 19a)", fd.q19a)
  if (fd.q19b) push("Opmerkingen toekomst melkveehouderij / vragenlijst (vraag 19b)", fd.q19b)

  return lines.join("\n")
}
