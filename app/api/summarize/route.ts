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

/** Samenvatting herschrijven op basis van feedback (zelfde stijl). */
const REVISE_SYSTEM_PROMPT = `Je bent een ervaren adviseur. De melkveehouder heeft een samenvatting gekregen en geeft feedback over wat zij willen laten aanpassen. Herschrijf de samenvatting zodat de feedback erin is verwerkt. Blijf informeel, Nederlands, en behoud dezelfde opbouw (korte inleiding, kernpunten, afsluiting). Geen advies toevoegen. Maximaal 400 woorden. Geef alleen de herziene samenvatting, geen toelichting.`;

/** Univé vragenlijst melkveehouders: lopende, toegankelijke samenvatting van de ingevulde antwoorden. */
const UNIVE_SYSTEM_PROMPT = `Je bent een ervaren adviseur voor melkveehouders. Je krijgt de ingevulde vragenlijst van een melkveehouder. Schrijf een lopende samenvatting: één vloeiend, toegankelijk stuk tekst dat de essentie van de vragenlijst weergeeft en waarin de deelnemer zich herkent ("dit is mijn verhaal").

DOEL:
- Van alle ingevulde vragen en open antwoorden uit de input één samenhangend verhaal maken.
- Geen losse bulletpoints of staccato-zinnen; schrijf in doorlopende alinea's die natuurlijk in elkaar overlopen.
- Elk relevant antwoord uit de vragenlijst (bedrijf, situatie, zorgen, plannen, ondersteuning, verdienmodel, toelichtingen) verweef je in het verhaal.

STIJL:
- Nederlands, informeel en toegankelijk. Alsof een adviseur het verhaal van de melkveehouder navertelt.
- Schaalcijfers (1–7) noem je niet letterlijk; vertaal naar gewone taal (bijv. "verduurzaming vindt hij belangrijk", "hij voelt zich redelijk zeker over zijn invloed").
- Respectvol en niet-veroordelend. Geen advies of aanbevelingen toevoegen.

REGELS:
- Gebruik uitsluitend informatie uit de input. Geen namen, bedrijfsnamen, locaties of herleidbare gegevens.
- Neem alle ingevulde vragen en open antwoorden mee die inhoud hebben; niets weglaten dat de melkveehouder heeft ingevuld.
- Maximaal 500 woorden. Geef alleen de samenvatting, geen inleiding of toelichting eromheen.`;

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
