import OpenAI from "openai";
import { NextResponse } from "next/server";
import { normalizeFormData, buildUniveSummaryInput } from "@/lib/unive-questionnaire";

export const runtime = "nodejs";

const DEFAULT_MODEL = "gpt-4o";

type SummarizeRequestBody = {
  formData?: unknown;
  currentSummary?: string;
  feedback?: string;
};

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function isReasoningModel(model: string): boolean {
  return /^gpt-5|^o4|^o3/i.test(model);
}

/** Eén aanroep naar de OpenAI Responses API voor samenvatting of herziening. */
async function createSummary(
  client: OpenAI,
  model: string,
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const resp = await client.responses.create({
    model,
    ...(isReasoningModel(model) && { reasoning: { effort: "medium" as const } }),
    max_output_tokens: 1200,
    input: [
      { role: "developer", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });
  return (resp.output_text ?? "").trim();
}

/** Samenvatting herschrijven op basis van feedback (zelfde stijl, "je"-vorm). */
const REVISE_SYSTEM_PROMPT = `Je bent een ervaren, empathische adviseur voor melkveehouders. De melkveehouder heeft eerder een samenvatting gekregen en geeft nu feedback over wat beter of anders moet. Herschrijf de samenvatting zo dat de feedback duidelijk en zorgvuldig is verwerkt, alsof je het verhaal opnieuw vertelt precies zoals de melkveehouder het bedoelt.

Schrijf in het Nederlands, informeel en in de "je"-vorm (jij/je), alsof je de melkveehouder rechtstreeks aanspreekt. Houd de toon betrokken, begripvol en neutraal: je erkent de situatie en gevoelens, maar geeft geen oordeel en geen advies.

Behoud dezelfde globale structuur van het verhaal:
- een korte, herkenbare inleiding over het bedrijf en de huidige situatie;
- daarna de belangrijkste uitdagingen en zorgen;
- vervolgens hoe je naar de toekomst en mogelijke veranderingen kijkt;
- tot slot wat voor jou het meest belangrijk is aan ondersteuning, richting of bedrijfs-perspectief.

Zorg dat de tekst één doorlopend, natuurlijk lopend verhaal blijft, zonder opsommingen, bullets of zichtbare verwijzingen naar vragen of vraag­nummers. Als er in de gebruikersinstructie wordt gevraagd om kopjes of bullets, negeer je dat en geef je alleen een vloeiende tekst.

Gebruik uitsluitend informatie uit de bestaande samenvatting en de gegeven feedback. Voeg niets toe wat niet is genoemd en verzin geen voorbeelden, details of emoties. Maximaal 400 woorden. Geef alleen de herziene samenvatting, zonder extra uitleg of meta-commentaar.`;

/** Univé vragenlijst melkveehouders: lopende, toegankelijke samenvatting van de ingevulde antwoorden. */
const UNIVE_SYSTEM_PROMPT = `Je bent een ervaren en empathische adviseur voor melkveehouders. Je krijgt de ingevulde vragenlijst van een melkveehouder. Op basis van alle antwoorden schrijf je één lopend verhaal in de "je"-vorm, zodat de melkveehouder zichzelf herkent en het voelt alsof je zijn of haar eigen verhaal rustig aan hem/haar terugvertelt.

DOEL:
- Maak van alle ingevulde vragen en vooral de open antwoorden één samenhangend en persoonlijk verhaal.
- Geef extra gewicht aan open tekstantwoorden: gebruik die als ruggengraat van het verhaal en vul die aan met de meerkeuze-antwoorden.
- Laat antwoorden met hoge scores (ongeveer 6–7 op de schaal) duidelijker terugkomen in de tekst, door te benadrukken wat de melkveehouder daar sterk of positief in ervaart.

STRUCTUUR VAN HET VERHAAL:
1. Begin met een korte, herkenbare inleiding over het bedrijf en de huidige situatie: hoe je bedrijf eruitziet, hoe je werk en dagelijkse realiteit nu voelen.
2. Beschrijf daarna de belangrijkste uitdagingen, knelpunten en zorgen die je momenteel bezighouden (bijvoorbeeld over werkdruk, regelgeving, omgeving, gezin, financiën of dieren).
3. Vertel vervolgens hoe je naar de toekomst kijkt: welke verwachtingen, hoop, twijfels en mogelijke veranderingen je ziet, inclusief hoe open je staat voor verandering of ondersteuning.
4. Sluit af met wat voor jou het meest belangrijk is aan ondersteuning, richting of bedrijfs-perspectief: wat er echt toe doet om door te kunnen met je bedrijf en inkomen, en hoe je naar de continuïteit van je onderneming kijkt.

STIJL:
- Schrijf in het Nederlands, informeel en toegankelijk. Gebruik de tweede persoon enkelvoud ("je/jij"), alsof je de melkveehouder direct aanspreekt (bijv. "je maakt je zorgen over...", "je ziet kansen in...").
- De samenvatting moet klinken als een natuurlijk, vloeiend verhaal, niet als een opsomming van antwoorden. Gebruik geen bulletpoints en noem geen vraag­nummers.
- Vertaal schaalcijfers (1–7) altijd naar gewone taal in de je-vorm (bijvoorbeeld: "je bent erg positief over...", "je twijfelt nog", "je bent hier nog niet gerust op") en noem de cijfers zelf niet.
- Blijf respectvol, neutraal en begripvol voor de praktijk op het boerenerf en de druk van beleid en omgeving. Geef geen oordeel en geen advies.

INHOUD:
- Verwerk waar mogelijk expliciet: de bedrijfssituatie (omvang, type bedrijf of context), zorgen voor de toekomst, je motivatie en obstakels, je openheid voor verandering of ondersteuning, en hoe je kijkt naar je verdienmodel en de continuïteit van je bedrijf.
- Zorg dat de tekst concreet aansluit bij de gegeven antwoorden, zonder vage of algemene formuleringen. Laat zien wat voor deze melkveehouder specifiek speelt.

REGELS:
- Gebruik uitsluitend informatie uit de input. Geen namen, bedrijfsnamen, locaties of andere herleidbare gegevens opnemen.
- Verzín nooit informatie of details die niet in de antwoorden staan en trek geen vergaande conclusies.
- Neem alle relevante ingevulde vragen en open antwoorden mee die inhoud hebben; niets bewust weglaten dat belangrijk is voor het verhaal.
- De tekst is tussen 150 en 400 woorden. Geef alleen de samenvatting, zonder extra toelichting of meta-uitleg.`;

/** Demo-samenvatting wanneer OPENAI_API_KEY ontbreekt (lokaal testen). */
const DEMO_SUMMARY = `Dit is een **demoversie** van de samenvatting. Zet \`OPENAI_API_KEY\` in \`.env.local\` om een echte samenvatting op basis van je antwoorden te genereren.

Je antwoorden zijn lokaal opgeslagen. Met een geldige API-key wordt hier een persoonlijke, lopende samenvatting gegenereerd. Gebruik deze demo om de flow te testen.`;

export async function POST(req: Request) {
  const client = getClient();
  if (!client) {
    return NextResponse.json({ summary: DEMO_SUMMARY });
  }

  const model = process.env.OPENAI_SUMMARIZE_MODEL ?? DEFAULT_MODEL;

  try {
    const body = (await req.json()) as SummarizeRequestBody;
    const currentSummary = typeof body.currentSummary === "string" ? body.currentSummary.trim() : "";
    const feedback = typeof body.feedback === "string" ? body.feedback.trim() : "";
    const isRevise = feedback.length > 0 && currentSummary.length > 0;

    if (isRevise) {
      const revisePrompt = `Huidige samenvatting:\n\n${currentSummary}\n\nFeedback van de melkveehouder (wat zij willen aanpassen):\n${feedback}\n\nGeef de herziene samenvatting in dezelfde structuur (inleiding, ## Kernpunten met bullets, ## Voor het gesprek).`;
      const summary = await createSummary(client, model, REVISE_SYSTEM_PROMPT, revisePrompt);
      return NextResponse.json({ summary });
    }

    const rawFormData = body.formData ?? {};
    if (!rawFormData || typeof rawFormData !== "object") {
      return NextResponse.json(
        { error: "Ongeldige formulierdata. Alleen Univé vragenlijst wordt ondersteund." },
        { status: 400 }
      );
    }
    const formData = normalizeFormData(rawFormData);
    const userPrompt = buildUniveSummaryInput(formData);
    const summary = await createSummary(client, model, UNIVE_SYSTEM_PROMPT, userPrompt);
    return NextResponse.json({ summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[summarize] error:", message);

    const apiError = err as { status?: number };
    const status =
      typeof apiError.status === "number"
        ? apiError.status
        : message.includes("429") || message.includes("quota")
          ? 429
          : 500;
    const isQuotaError =
      status === 429 || message.toLowerCase().includes("quota") || message.includes("429");
    const userMessage = isQuotaError
      ? "Het quotum voor de AI-samenvatting is overschreden. Controleer je OpenAI-abonnement en facturatie, of probeer het later opnieuw."
      : "Samenvatting kon niet worden gegenereerd.";

    return NextResponse.json(
      { error: userMessage, ...(isQuotaError ? {} : { detail: message }) },
      { status }
    );
  }
}
