import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

const SYSTEM_PROMPT = `Je bent een ervaren, mensgerichte time-out coach en schrijft een persoonlijke terugkoppeling op basis van een Time-out intake.
Je ontvangt alleen de (gestructureerde) antwoorden van een werknemer die preventief een time-out heeft aangevraagd.

DOEL
Schrijf één lopend, persoonlijk verhaal in de tweede persoon (“je”), in helder Nederlands (B1–B2, volwassen toon).
De tekst voelt alsof een deskundige time-out coach hem heeft geschreven: warm, concreet, professioneel.
Je mag richting geven en advies geven over werk- en gesprekstappen (grenzen, prioriteiten, communicatie, planning, afspraken, ondersteuning), maar nooit medisch.

HARD RULES (nooit overtreden)
1) Gebruik uitsluitend informatie die expliciet in de input staat. Je mag verbanden leggen als je ze direct kunt onderbouwen met minimaal 2 concrete ingevulde antwoorden (en die onderbouwing in dezelfde zin meeneemt). Voeg geen nieuwe feiten toe.
2) Geen medische termen/diagnoses of medische conclusies. Geen behandeladviezen, geen verwijzingen naar medicatie/therapie. Gebruik alledaagse woorden (bijv. “slechter slapen”, “weinig energie”).
3) Anonimiseer: geen namen, bedrijfsnamen, locaties, afdelingen of herkenbare details. Gebruik neutrale termen (“een collega”, “een leidinggevende”, “thuis”, “werk”).
4) Noem NOOIT de schaal of cijfers (“1–7”, “X van 7”, “score”, “risico-score”, “zwaarte-score”, “belangrijkheid-score”, “veiligheid-score”). De cijfers zijn alleen input voor jou.
5) Vertaal alle schaalwaarden naar mensentaal (consequent). Als iets niet is ingevuld: benoem dat neutraal (“Niet ingevuld”) of laat het weg; ga niet gokken.
6) Blijf respectvol en niet-veroordelend. Geen dramatiek, geen schuldvraag.
7) Je adviezen moeten passen binnen preventieve begeleiding en werkcontext. Geen medische adviezen.

VERBANDEN & INZICHT (verplicht)
- Leg minimaal 4 keer een verband tussen antwoorden (patronen/consistenties/spanningsvelden).
- Elk verband is gebaseerd op minimaal 2 concrete inputs (bijv. duur + signalen, factoren + doelen, randvoorwaarden + risico).
- Formuleer als coach-observatie, niet als diagnose:
  - “Wat ik bij elkaar zie, is …”
  - “Het valt op dat …”
  - “Je beschrijft tegelijk … en …; dat schuurt omdat …”
  - “Dit maakt begrijpelijk dat …”

ADVIESROL (toegestaan binnen grenzen)
Je mag:
- concrete gesprekspunten voorstellen (wat bespreken, welke vraag stellen, welke keuze expliciet maken)
- een realistische eerste stap voor de komende 1–2 weken formuleren (bijv. grenzen, prioriteiten, rustmomenten, afspraken, communicatie)
- opties geven in taal van keuze (“je kunt overwegen…”, “een logische eerste stap is…”)
Je mag niet:
- medische verklaringen of medische adviezen geven
- harde uitspraken doen die niet in de input staan

LEESBAARHEID & OPMAAK (verplicht)
- Schrijf in Markdown.
- Gebruik 3–6 korte paragrafen met witregels ertussen.
- Begin elke paragraaf met een korte, natuurlijke lead-zin (max 7 woorden) die richting geeft, gevolgd door 2–5 zinnen toelichting.
  Voorbeelden van lead-zinnen (kies passend): 
  “De kern in één zin.” / “Wat je nu draagt.” / “Wat je merkt op werk.” / “Waar het schuurt.” / “Wat je nodig hebt.” / “Richting voor het gesprek.”
- Gebruik geen bulletlists en geen Markdown-koppen (dus geen # of ##).

BOLD (verplicht, maar spaarzaam)
- Zet 6–12 woorden/woordgroepen vetgedrukt met **...**.
- Bold alleen woorden die letterlijk uit de input komen of direct verwijzen naar ingevulde thema’s (bijv. **werkdruk**, **minder scherp**, **grenzen**, **terugkoppeling**, **rust**, **conflict**, **mantelzorg**).
- Geen vetgedrukte hele zinnen. Max 1–5 woorden per bold-fragment.
- Gebruik bold om de lezer snel houvast te geven: oorzaak, signalen, spanning, doelen, randvoorwaarden, eerstvolgende stap.

STRUCTUUR (flow, zonder formele kopjes)
Volg deze volgorde in de paragrafen:
1) Erkenning + kern van wat speelt (oorzaak, sinds wanneer, factoren, vertaald gevoel van zwaarte/risico in mensentaal).
2) Impact op werk: concrete signalen en wat dat betekent in samenhang (zonder diagnose).
3) Verdieping: route-specifieke details + verbanden (minimaal 2 verbanden hier).
4) Richting: doelen, randvoorwaarden, terugkoppeling werkgever.
5) Eerste stappen: 2–4 concrete, niet-medische stappen voor 1–2 weken in lopende tekst (geen bullets), zoals: grenzen/prioriteiten/afspraken/communicatie/rustmomenten.

LENGTE
- Richtlijn: tot ~1000 woorden als de input rijk is, maar geen herhaling.
- Lever alleen de tekst (geen kopjes, geen bullets, geen lijstjes, geen meta-uitleg).`;

function scaleToWords(
  value: unknown,
  kind: "zwaarte" | "risico" | "belangrijkheid" | "veiligheid"
): string {
  const n = typeof value === "number" ? value : Number(value);
  const band =
    Number.isFinite(n) && n <= 2
      ? "licht / beperkt"
      : n === 3
      ? "aanwezig, maar nog te dragen"
      : n === 4
      ? "middelmatig / duidelijk aanwezig"
      : n === 5
      ? "zwaar / fors"
      : n === 6
      ? "heel zwaar / dringend"
      : n >= 7
      ? "extreem zwaar / acuut"
      : "Niet ingevuld";

  if (band === "Niet ingevuld") return band;

  if (kind === "zwaarte") return `dit weegt ${band}`;
  if (kind === "risico") return `de kans dat dit je werk gaat raken is ${band}`;
  if (kind === "belangrijkheid") return `dit gesprek voelt ${band} belangrijk`;
  if (kind === "veiligheid") return `je voelt je ${band} veilig om dit te bespreken`;

  return band;
}

function pushLine(lines: string[], label: string, value: unknown) {
  if (value === undefined || value === null) return;
  const s = String(value).trim();
  if (!s) return;
  lines.push(`${label}: ${s}`);
}

function pushArray(lines: string[], label: string, value: unknown) {
  const arr = Array.isArray(value) ? value : [];
  const cleaned = arr.map(String).map((x) => x.trim()).filter(Boolean);
  if (cleaned.length > 0) lines.push(`${label}: ${cleaned.join(", ")}`);
}

function buildUserPrompt(fd: Record<string, unknown>): string {
  const lines: string[] = [];

  // Basis
  pushLine(lines, "Hoofdoorzaak", fd.hoofdoorzaak);
  pushLine(lines, "Toelichting anders", fd.andersText);

  lines.push(`Beleving zwaarte: ${scaleToWords(fd.zwaarte, "zwaarte")}`);
  pushArray(lines, "Meespelende factoren", fd.factoren);

  pushLine(lines, "Speelt sinds", fd.sinds);
  lines.push(`Inschatting risico: ${scaleToWords(fd.risico, "risico")}`);

  pushArray(lines, "Signalen op werk", fd.signalen);
  pushArray(lines, "Doelen gesprek", fd.doelen);

  lines.push(`Belangrijkheid gesprek: ${scaleToWords(fd.belangrijkheid, "belangrijkheid")}`);

  // Route-specific
  const hoofdoorzaak = String(fd.hoofdoorzaak ?? "").toLowerCase();

  if (hoofdoorzaak === "werkdruk" || hoofdoorzaak === "incident") {
    pushArray(lines, "Bronnen werkdruk", fd.werkdrukDruk);
    pushLine(lines, "Duur werkdruk", fd.werkdrukDuur);
    pushArray(lines, "Al geprobeerd", fd.werkdrukGeprobeerd);
    pushLine(lines, "Wat zou helpen", fd.werkdrukHelpt);
  } else if (hoofdoorzaak === "samenwerking") {
    pushLine(lines, "Conflict met", fd.conflictMet);
    pushArray(lines, "Gaat over", fd.conflictWaarover);
    // veiligheid is vaak in je form als 1-7; vertaal alvast
    lines.push(`Veiligheidsgevoel: ${scaleToWords(fd.conflictVeilig, "veiligheid")}`);
    pushLine(lines, "Gewenste uitkomst", fd.conflictUitkomst);
  } else if (hoofdoorzaak === "prive" || hoofdoorzaak === "combinatie") {
    pushArray(lines, "Privé gaat over", fd.priveWaarover);
    pushLine(lines, "Wil delen", fd.priveDelen);
    pushLine(lines, "Toelichting (privé)", fd.priveDelenText);
    pushArray(lines, "Nodig van werk", fd.priveNodig);

    pushLine(lines, "Mantelzorg voor", fd.mantelzorgVoor);
    if (fd.mantelzorgZwaar !== undefined && fd.mantelzorgZwaar !== null) {
      lines.push(`Mantelzorg (zwaarte beleving): ${scaleToWords(fd.mantelzorgZwaar, "zwaarte")}`);
    }
    pushLine(lines, "Waar knelt het", fd.mantelzorgKnelt);

    pushLine(lines, "Relatie", fd.relatieWat);
    pushLine(lines, "Kinderen", fd.kinderenWat);
  } else if (hoofdoorzaak === "energie") {
    pushArray(lines, "Merkt", fd.energieMerkt);
    pushArray(lines, "Zorg om", fd.energieZorg);
    pushLine(lines, "Hulp nodig bij", fd.energieHulp);
  }

  if (hoofdoorzaak === "combinatie") {
    const pctWerk = typeof fd.combinatieVerdeling === "number" ? fd.combinatieVerdeling : Number(fd.combinatieVerdeling);
    if (Number.isFinite(pctWerk)) {
      const pctPrive = Math.max(0, Math.min(100, 100 - pctWerk));
      lines.push(`Verdeling belasting: ongeveer ${pctWerk}% werk en ${pctPrive}% privé`);
    }
    pushLine(lines, "Wat zou verandering brengen", fd.combinatieVerandering);
  }

  // Afsluiting / randvoorwaarden
  pushArray(lines, "Nodig om door te komen", fd.closingNodig);
  pushLine(lines, "Wil bereiken", fd.randWelBereiken);
  pushLine(lines, "Wil niet", fd.randNietBereiken);
  pushLine(lines, "Terugkoppeling werkgever", fd.terugkoppeling);

  return lines.join("\n");
}

export async function POST(req: Request) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY ontbreekt in environment variables." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const formData = (body?.formData ?? {}) as Record<string, unknown>;

    const userPrompt = buildUserPrompt(formData);

    const resp = await client.responses.create({
      model: "gpt-5.2",
      reasoning: { effort: "high" },
      max_output_tokens: 1800,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    return Response.json({ summary: resp.output_text ?? "" });
  } catch (err: any) {
    console.error("timeout/summarize error:", err?.message ?? err);
    return new Response(
      JSON.stringify({ error: "Summarize failed", detail: err?.message ?? String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
