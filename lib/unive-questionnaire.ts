/**
 * Univé Vragenlijst Melkveehouders – answer schema and mapping to summary input.
 * URL en webhook-payload gebruiken opeenvolgende nummering q1–q21 (zelfde volgorde als stappen).
 * Form keys (q0_leeftijd, q1, q2_cows, …) blijven voor state/API; buildSequentialPayload mapt naar q1–q21.
 */

export interface UniveFormData {
  // Algemeen – in payload: q1=leeftijd, q2=gemeente (geslacht niet in flow)
  q0_geslacht: string
  q0_leeftijd: string
  q0_gemeente: string

  // Deel 1 – Je bedrijf (payload q3=type, q4=grootte, q5=fase)
  q1: string
  q1_anders: string
  q1_omschakeling: string
  q1_omschakeling_anders: string
  q2_cows: number
  q2_hectares: number
  q3: string

  // Deel 2 – Huidige situatie en toekomstbeeld (payload q6–q9)
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
  q10_kostenstructuur: number // invloed kostenstructuur (1–7)
  q10_omvang: number // invloed op omvang van het bedrijf (1–7)
  q10_grondgebruik: number // invloed op grondgebruik (1–7)
  q10_samenwerking: number // invloed op samenwerking met andere partijen (1–7)
  q10_afzet: number // invloed op afzet van producten (1–7)
  q10_verbreding: number // invloed op verbreding (1–7)
  q10_anders_score: number // invloed op andere onderdelen (1–7) – niet meer in UI gebruikt
  q10_anders: string // omschrijving andere onderdelen – niet meer in UI gebruikt
  q10_toelichting: string // toelichting ervaren invloed

  // Deel 3 – Veranderingen in bedrijfsvoering (payload q10–q13)
  q8: string
  q8a: string
  // Matrix aanpassingen per thema – payload q10
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
  // Aanleidingen aanpassingen (alleen bij ≥1 Ja in matrix) – payload q11
  q11b_aanleidingen: string[] // max 2
  q11b_regelgeving: string
  q11b_anders: string
  q11b_toelichting: string
  q9: string[] // legacy
  q9_anders: string
  q9_regelgeving: string
  q10: string // onder welke omstandigheden – payload q12
  q11: string[] // wat houdt tegen (max 2) – payload q13
  q11_anders: string
  q11_toelichting: string

  // Deel 4 – Welke ondersteuning zou helpen? (payload q14–q18)
  // Open voor vormen ondersteuning (sliders 1–7) – payload q14
  q14_open_eenmalig: number
  q14_open_structureel: number
  q14_open_pacht: number
  q14_open_co2: number
  q14_open_premiekorting: number
  q14_open_teeltverzekering: number
  q14_open_andere: string // "" | "Ja" | "Nee"
  q14_open_andere_naamelijk: string
  q14_open_andere_score: number
  q14_open_toelichting: string
  // Welke vormen ondersteuning waardevol (max 2) – payload q15
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
  // Opties overwegen (meerdere, min 1) + top 3 toepassen – payload q16
  q16a: string[]
  q16a_anders: string
  q16b: string[]
  q16b_anders: string
  q14: string[]
  q14_anders: string

  // Behoefte aanvullende inkomsten/risicospreiding (1 slider) – payload q17
  q17a: number
  // Mogelijkheden per richting (sliders 1–7 + Anders namelijk) – payload q18
  q17b_directe_verkoop: number
  q17b_nieuwe_teelten: number
  q17b_co2: number
  q17b_natuur_biodiversiteit: number
  q17b_anders: string
  q17b_anders_score: number
  q17_toelichting: string

  // Deel 5 – Verdienmodel en kwetsbaarheden (payload q19)
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
  q16_werkplezier: number
  q16_anders: string
  q16_anders_score: number // 1–7 bij ingevulde "Anders, namelijk"
  q16_toelichting: string

  // Deel 6 – Afsluiting (payload q20–q21)
  q17: string
  q18: string
  q19_toestemming_contact: string
  q19_naam: string
  q19_email: string
  q19_telefoon: string
  q19_opmerkingen: string
  q19a: string // iets meegeven – payload q20
  q19b: string // optioneel: opmerkingen over toekomst melkveehouderij of vragenlijst

  // Verloting boerenpakket – payload q21 (persoonsgegevens alleen voor winactie)
  q21_verloting: string // "" | "Ja" | "Nee"
  q21_email: string // e-mail voor contact bij winnen; alleen gebruikt voor de verloting
}

export const UNIVE_INITIAL_FORM_DATA: UniveFormData = {
  // Algemeen – payload q1=leeftijd, q2=gemeente
  q0_geslacht: "",
  q0_leeftijd: "",
  q0_gemeente: "",

  // Deel 1 – payload q3=type, q4=grootte, q5=fase
  q1: "",
  q1_anders: "",
  q1_omschakeling: "",
  q1_omschakeling_anders: "",
  q2_cows: 0,
  q2_hectares: 0,
  q3: "",

  // Deel 2 – payload q6–q9
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

  // Deel 3 – payload q10–q13
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

  // Deel 4 – payload q14–q18
  q14_open_eenmalig: 4,
  q14_open_structureel: 4,
  q14_open_pacht: 4,
  q14_open_co2: 4,
  q14_open_premiekorting: 4,
  q14_open_teeltverzekering: 4,
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

  // Legacy sliders rond ondersteuning en aanvullende opties
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

  // Deel 5 – payload q19
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
  q16_werkplezier: 4,
  q16_anders: "",
  q16_anders_score: 4,
  q16_toelichting: "",

  // Deel 6 – payload q20 (19a), q21 (contact + verloting)
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
  "q14_open_eenmalig", "q14_open_structureel", "q14_open_pacht", "q14_open_co2", "q14_open_premiekorting", "q14_open_teeltverzekering", "q14_open_andere_score",
  "q12_financieel", "q12_pacht", "q12_co2", "q12_premiekorting", "q12_klimaatadaptie", "q12_biodiversiteit",
  "q13_financieel", "q13_pacht", "q13_co2", "q13_premiekorting", "q13_klimaatadaptie", "q13_biodiversiteit",
  "q15a", "q15a_nevenactiviteiten", "q15a_pacht", "q15a_risicospreiding", "q15a_verbreding",
  "q17a", "q17b_directe_verkoop", "q17b_nieuwe_teelten", "q17b_co2", "q17b_natuur_biodiversiteit", "q17b_anders_score",
  "q16_marge", "q16_schuldenlast", "q16_continuïteit", "q16_stabiliteit", "q16_voortzetten", "q16_waardebehoud", "q16_werkplezier", "q16_anders_score",
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
 * Payload voor webhook: opeenvolgende vragen q1, q2, … met antwoord als omschrijving (labeltekst).
 * Alleen de zichtbare antwoordtekst (bijv. "Jonger dan 30", "Gangbaar"); tooltips worden niet meegestuurd.
 * Zelfde nummering als URL (?stap=q1, q2, …).
 */
export function buildSequentialPayload(fd: UniveFormData): Record<string, string> {
  const out: Record<string, string> = {};
  const set = (n: number, v: string) => {
    const s = (v ?? "").trim();
    if (s) out[`q${n}`] = s;
  };

  // q1 – Leeftijd (omschrijving = gekozen optie, bijv. "Jonger dan 30")
  set(1, fd.q0_leeftijd ?? "");

  // q2 – Gemeente (vrije tekst, bijv. "Lingewaard")
  set(2, fd.q0_gemeente ?? "");

  // q3 – Type bedrijf (+ anders/omschakeling)
  const q3val =
    fd.q1 === "Anders" && fd.q1_anders
      ? fd.q1_anders
      : fd.q1 === "In omschakeling" && fd.q1_omschakeling
        ? `${fd.q1} – ${fd.q1_omschakeling}${fd.q1_omschakeling === "Anders, namelijk:" && fd.q1_omschakeling_anders ? ": " + fd.q1_omschakeling_anders : ""}`
        : fd.q1 ?? "";
  set(3, q3val);

  // q4 – Grootte bedrijf (melkkoeien, hectare)
  if (fd.q2_cows > 0 || fd.q2_hectares > 0) {
    set(4, `${fd.q2_cows} melkkoeien, ${fd.q2_hectares} hectare`);
  }

  // q5 – Fase bedrijf
  set(5, fd.q3 ?? "");

  // q6 – Ontwikkelingen met meeste invloed (+ regelgeving doorvraag, anders)
  const q4arr = Array.isArray(fd.q4) ? fd.q4 : [];
  if (q4arr.length) {
    let q6 = q4arr.join(", ");
    if (q4arr.includes("Regelgeving")) {
      const q4a = Array.isArray(fd.q4a) ? fd.q4a : [];
      if (q4a.length) q6 += " – Regelgeving: " + q4a.join(", ");
      if (q4a.includes("Anders, namelijk:") && fd.q4a_anders) q6 += " " + fd.q4a_anders;
    }
    if (q4arr.includes("Anders, namelijk:") && fd.q4_anders) q6 += " – Anders: " + fd.q4_anders;
    set(6, q6);
  }

  // q7 – Stellingen verduurzaming (5a, 5b, 5c) + toelichting
  const q7parts: string[] = [];
  if (fd.q5a != null) q7parts.push(`Verduurzaming: ${fd.q5a}`);
  if (fd.q5b != null) q7parts.push(`CO₂-reductie: ${fd.q5b}`);
  if (fd.q5c != null) q7parts.push(`Biodiversiteit: ${fd.q5c}`);
  if (fd.q5_toelichting?.trim()) q7parts.push(fd.q5_toelichting.trim());
  if (q7parts.length) set(7, q7parts.join(". "));

  // q8 – Grootste zorgen
  set(8, fd.q6 ?? "");

  // q9 – Invloed onderdelen (sliders + toelichting)
  const q9parts: string[] = [];
  if (fd.q10_kostenstructuur != null) q9parts.push(`Kostenstructuur: ${fd.q10_kostenstructuur}`);
  if (fd.q10_omvang != null) q9parts.push(`Omvang: ${fd.q10_omvang}`);
  if (fd.q10_grondgebruik != null) q9parts.push(`Grondgebruik: ${fd.q10_grondgebruik}`);
  if (fd.q10_samenwerking != null) q9parts.push(`Samenwerking: ${fd.q10_samenwerking}`);
  if (fd.q10_afzet != null) q9parts.push(`Afzet: ${fd.q10_afzet}`);
  if (fd.q10_verbreding != null) q9parts.push(`Verbreding: ${fd.q10_verbreding}`);
  if (fd.q10_toelichting?.trim()) q9parts.push(fd.q10_toelichting.trim());
  if (q9parts.length) set(9, q9parts.join(". "));

  // q10 – Matrix aanpassingen (Ja/Nee per thema + toelichtingen)
  const q10rows: string[] = [];
  const themes: { key: keyof UniveFormData; keyToel: keyof UniveFormData; label: string }[] = [
    { key: "q11_duurzaamheid", keyToel: "q11_duurzaamheid_toelichting", label: "Duurzaamheid" },
    { key: "q11_bedrijfsschaal", keyToel: "q11_bedrijfsschaal_toelichting", label: "Bedrijfsschaal" },
    { key: "q11_bedrijfsvoering", keyToel: "q11_bedrijfsvoering_toelichting", label: "Bedrijfsvoering" },
    { key: "q11_verdienmodel", keyToel: "q11_verdienmodel_toelichting", label: "Verdienmodel" },
    { key: "q11_investeringen", keyToel: "q11_investeringen_toelichting", label: "Investeringen" },
  ];
  for (const { key, keyToel, label } of themes) {
    const v = (fd[key] as string) ?? "";
    if (v) q10rows.push(`${label}: ${v}${v === "Ja" && fd[keyToel] ? " – " + fd[keyToel] : ""}`);
  }
  if (q10rows.length) set(10, q10rows.join(" | "));

  // q11 – Aanleidingen aanpassingen (11b)
  const q11b = Array.isArray(fd.q11b_aanleidingen) ? fd.q11b_aanleidingen : [];
  if (q11b.length) {
    let t = q11b.join(", ");
    if (q11b.includes("Nieuwe regelgeving") && fd.q11b_regelgeving) t += " – " + fd.q11b_regelgeving;
    if (q11b.includes("Anders, namelijk:") && fd.q11b_anders) t += " – " + fd.q11b_anders;
    if (fd.q11b_toelichting?.trim()) t += " – " + fd.q11b_toelichting.trim();
    set(11, t);
  }

  // q12 – Onder welke omstandigheden
  set(12, fd.q10 ?? "");

  // q13 – Wat houdt tegen
  const q11arr = Array.isArray(fd.q11) ? fd.q11 : [];
  if (q11arr.length) {
    let t = q11arr.join(", ");
    if (q11arr.includes("Anders, namelijk:") && fd.q11_anders) t += " – " + fd.q11_anders;
    if (fd.q11_toelichting?.trim()) t += " – " + fd.q11_toelichting.trim();
    set(13, t);
  }

  // q14 – Open voor ondersteuning (sliders + andere + toelichting)
  const q14parts: string[] = [];
  if (fd.q14_open_eenmalig != null) q14parts.push(`Eenmalig: ${fd.q14_open_eenmalig}`);
  if (fd.q14_open_structureel != null) q14parts.push(`Structureel: ${fd.q14_open_structureel}`);
  if (fd.q14_open_pacht != null) q14parts.push(`Pacht: ${fd.q14_open_pacht}`);
  if (fd.q14_open_co2 != null) q14parts.push(`CO₂: ${fd.q14_open_co2}`);
  if (fd.q14_open_premiekorting != null) q14parts.push(`Premiekorting: ${fd.q14_open_premiekorting}`);
  if (fd.q14_open_teeltverzekering != null) q14parts.push(`Teeltverzekering: ${fd.q14_open_teeltverzekering}`);
  if (fd.q14_open_andere_naamelijk?.trim()) q14parts.push("Andere: " + fd.q14_open_andere_naamelijk.trim());
  if (fd.q14_open_toelichting?.trim()) q14parts.push(fd.q14_open_toelichting.trim());
  if (q14parts.length) set(14, q14parts.join(". "));

  // q15 – Waardevolle ondersteuning
  const q15w = Array.isArray(fd.q15_waardevol) ? fd.q15_waardevol : [];
  if (q15w.length) {
    let t = q15w.join(", ");
    if (q15w.includes("Anders, namelijk:") && fd.q15_waardevol_anders) t += " – " + fd.q15_waardevol_anders;
    if (fd.q15_waardevol_toelichting?.trim()) t += " – " + fd.q15_waardevol_toelichting.trim();
    set(15, t);
  }

  // q16 – Opties overwegen + top 3 toepassen (16a, 16b)
  const q16a = Array.isArray(fd.q16a) ? fd.q16a : [];
  const q16b = Array.isArray(fd.q16b) ? fd.q16b : [];
  if (q16a.length || q16b.length) {
    let t = "";
    if (q16a.length) t += "Overwegen: " + q16a.join(", ");
    if (q16a.includes("Anders, namelijk:") && fd.q16a_anders) t += " " + fd.q16a_anders;
    if (q16b.length) t += (t ? " | " : "") + "Top 3: " + q16b.join(", ");
    if (q16b.includes("Anders, namelijk:") && fd.q16b_anders) t += " " + fd.q16b_anders;
    set(16, t.trim());
  }

  // q17 – Behoefte aanvullende inkomsten (17a)
  if (fd.q17a != null) set(17, String(fd.q17a));

  // q18 – Mogelijkheden verbreding (17b sliders + anders + toelichting)
  const q18parts: string[] = [];
  if (fd.q17b_directe_verkoop != null) q18parts.push(`Directe verkoop: ${fd.q17b_directe_verkoop}`);
  if (fd.q17b_nieuwe_teelten != null) q18parts.push(`Nieuwe teelten: ${fd.q17b_nieuwe_teelten}`);
  if (fd.q17b_co2 != null) q18parts.push(`CO₂: ${fd.q17b_co2}`);
  if (fd.q17b_natuur_biodiversiteit != null) q18parts.push(`Natuur/biodiversiteit: ${fd.q17b_natuur_biodiversiteit}`);
  if (fd.q17b_anders?.trim()) q18parts.push("Anders: " + fd.q17b_anders.trim());
  if (fd.q17_toelichting?.trim()) q18parts.push(fd.q17_toelichting.trim());
  if (q18parts.length) set(18, q18parts.join(". "));

  // q19 – Rendabel ondernemen (q16 sliders + anders + toelichting)
  const q19parts: string[] = [];
  if (fd.q16_marge != null) q19parts.push(`Marge: ${fd.q16_marge}`);
  if (fd.q16_schuldenlast != null) q19parts.push(`Schuldenlast: ${fd.q16_schuldenlast}`);
  if (fd.q16_continuïteit != null) q19parts.push(`Continuïteit: ${fd.q16_continuïteit}`);
  if (fd.q16_stabiliteit != null) q19parts.push(`Stabiliteit: ${fd.q16_stabiliteit}`);
  if (fd.q16_voortzetten != null) q19parts.push(`Voortzetten: ${fd.q16_voortzetten}`);
  if (fd.q16_waardebehoud != null) q19parts.push(`Waardebehoud: ${fd.q16_waardebehoud}`);
  if (fd.q16_werkplezier != null) q19parts.push(`Werkplezier: ${fd.q16_werkplezier}`);
  if (fd.q16_anders?.trim()) q19parts.push("Anders: " + fd.q16_anders.trim());
  if (fd.q16_toelichting?.trim()) q19parts.push(fd.q16_toelichting.trim());
  if (q19parts.length) set(19, q19parts.join(". "));

  // q20 – Iets meegeven (19a)
  set(20, fd.q19a ?? "");

  // q21 – Contact + verloting (19 + 21)
  const q21parts: string[] = [];
  q21parts.push("Toestemming contact: " + (fd.q19_toestemming_contact || "Nee"));
  if (fd.q19_toestemming_contact === "Ja") {
    if (fd.q19_naam?.trim()) q21parts.push("Naam: " + fd.q19_naam.trim());
    if (fd.q19_email?.trim()) q21parts.push("E-mail: " + fd.q19_email.trim());
    if (fd.q19_telefoon?.trim()) q21parts.push("Telefoon: " + fd.q19_telefoon.trim());
  }
  q21parts.push("Verloting: " + (fd.q21_verloting || "Nee"));
  if (fd.q21_verloting === "Ja" && fd.q21_email?.trim()) q21parts.push("E-mail verloting: " + fd.q21_email.trim());
  set(21, q21parts.join(". "));

  return out;
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

  // Algemeen (payload q1=leeftijd, q2=gemeente)
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
  if (q11b.length) push("Belangrijkste aanleidingen voor aanpassingen (payload q11)", q11b)
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
  push("Open teeltverzekering (1–7)", fd.q14_open_teeltverzekering)
  if (fd.q14_open_andere_naamelijk || fd.q14_open_andere_score !== 4) push("Open andere ondersteuning, namelijk (1–7)", fd.q14_open_andere_score)
  if (fd.q14_open_andere_naamelijk) push("Andere ondersteuning namelijk", fd.q14_open_andere_naamelijk)
  if (fd.q14_open_toelichting) push("Toelichting openheid ondersteuning (q14)", fd.q14_open_toelichting)
  const q15w = Array.isArray(fd.q15_waardevol) ? fd.q15_waardevol : []
  if (q15w.length) push("Waardevolle vormen ondersteuning (max 2)", q15w)
  if (q15w.includes("Anders, namelijk:") && fd.q15_waardevol_anders) push("Waardevolle ondersteuning anders", fd.q15_waardevol_anders)
  if (fd.q15_waardevol_toelichting) push("Toelichting waardevolle ondersteuning (q15)", fd.q15_waardevol_toelichting)
  const q16a = Array.isArray(fd.q16a) ? fd.q16a : []
  if (q16a.length) push("Opties overwegen landgebruik/activiteiten (q16)", q16a)
  if (q16a.includes("Anders, namelijk:") && fd.q16a_anders) push("16a anders", fd.q16a_anders)
  const q16b = Array.isArray(fd.q16b) ? fd.q16b : []
  if (q16b.length) push("Top 3 toepassen (q16)", q16b)
  if (q16b.includes("Anders, namelijk:") && fd.q16b_anders) push("16b anders", fd.q16b_anders)
  push("Behoefte aanvullende inkomsten of risicospreiding (1–7, q17)", fd.q17a)
  push("Mogelijkheden directe verkoop (1–7)", fd.q17b_directe_verkoop)
  push("Mogelijkheden nieuwe teelten (1–7)", fd.q17b_nieuwe_teelten)
  push("Mogelijkheden vergoeding CO₂-vastlegging (1–7)", fd.q17b_co2)
  push("Mogelijkheden natuur- en biodiversiteitsbeheer (1–7)", fd.q17b_natuur_biodiversiteit)
  if (fd.q17b_anders) push("Mogelijkheden anders, namelijk", fd.q17b_anders)
  if (fd.q17_toelichting) push("Toelichting (q18)", fd.q17_toelichting)

  // Deel 5 – Verdienmodel en kwetsbaarheden (q19)
  push("Rendabel: voldoende marge (1–7)", fd.q16_marge)
  push("Rendabel: lage schuldenlast (1–7)", fd.q16_schuldenlast)
  push("Rendabel: continuïteit volgende generatie (1–7)", fd.q16_continuïteit)
  push("Rendabel: stabiliteit (1–7)", fd.q16_stabiliteit)
  push("Rendabel: bedrijf voortzetten (1–7)", fd.q16_voortzetten)
  push("Rendabel: waardebehoud (1–7)", fd.q16_waardebehoud)
  push("Rendabel: werkplezier en voldoening (1–7)", fd.q16_werkplezier)
  if (fd.q16_anders) push("Rendabel: anders, namelijk", fd.q16_anders)
  if (fd.q16_toelichting) push("Toelichting rendabel ondernemen (q19)", fd.q16_toelichting)

  // Deel 6 – Afsluiting (geen PII opnemen)
  if (fd.q19_opmerkingen) push("Aanvullende opmerkingen", fd.q19_opmerkingen)
  if (fd.q19a) push("Nog iets meegeven (praktijk, toekomst sector, vragenlijst)", fd.q19a)

  return lines.join("\n")
}
