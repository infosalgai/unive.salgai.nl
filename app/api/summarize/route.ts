import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  isUniveFormData,
  buildUniveSummaryInput,
  type UniveFormData,
} from "@/lib/unive-questionnaire";

export const runtime = "nodejs";

const DEFAULT_MODEL = "gpt-4o";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

/** Samenvatting herschrijven op basis van feedback (zelfde stijl). */
const REVISE_SYSTEM_PROMPT = `Je bent een ervaren adviseur. De melkveehouder heeft een samenvatting gekregen en geeft feedback over wat zij willen laten aanpassen. Herschrijf de samenvatting zodat de feedback erin is verwerkt. Blijf informeel, Nederlands, en behoud dezelfde opbouw (korte inleiding, kernpunten, afsluiting). Geen advies toevoegen. Maximaal 400 woorden. Geef alleen de herziene samenvatting, geen toelichting.`;

/** Univé vragenlijst melkveehouders: krachtige, gestructureerde samenvatting. */
const UNIVE_SYSTEM_PROMPT = `Je bent een ervaren adviseur voor melkveehouders. Je krijgt de ingevulde vragenlijst van een melkveehouder. Schrijf een korte, krachtige samenvatting waar de deelnemer zich in herkent: "dit is mijn verhaal."

DOELGROEP: melkveehouders die de vragenlijst zelf hebben ingevuld.
TAAL: Nederlands, informeel en toegankelijk.
LENGTE: Niet te lang. Maximaal 350 woorden totaal.

STRUCTUUR (gebruik exact deze opbouw in je antwoord):
1. Eén korte inleidende alinea (2–4 zinnen) die de situatie en het perspectief van de melkveehouder samenvat.
2. Daarna: "## Kernpunten" gevolgd door 3–6 bulletpoints (elke regel beginnend met "- ") met de belangrijkste punten: zorgen, aanpassingen, ondersteuning, verdienmodel – leg verbanden waar het kan.
3. Afsluiting: "## Voor het gesprek" met één korte alinea (1–3 zinnen) die het verhaal afrondt.

REGELS:
- Gebruik uitsluitend de informatie uit de input. Geen namen, bedrijfsnamen, locaties of herleidbare gegevens.
- Schaalcijfers (1–7) niet letterlijk noemen; vertaal naar mensentaal (bijv. "verduurzaming vindt hij belangrijk").
- Respectvol en niet-veroordelend. Geen advies of aanbevelingen.
- Alleen de samenvatting in bovenstaande structuur, geen extra tekst.`;

export async function POST(req: Request) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY ontbreekt. Zet deze in .env.local." },
      { status: 500 }
    );
  }

  const model = process.env.OPENAI_SUMMARIZE_MODEL ?? DEFAULT_MODEL;
  const isReasoningModel = /^gpt-5|^o4|^o3/i.test(model);

  try {
    const body = await req.json();
    let formData = (body?.formData ?? {}) as Record<string, unknown>;
    const currentSummary = typeof body?.currentSummary === "string" ? body.currentSummary.trim() : "";
    const feedback = typeof body?.feedback === "string" ? body.feedback.trim() : "";

    const isRevise = feedback.length > 0 && currentSummary.length > 0;

    if (!isRevise) {
      const hasFormData = Object.keys(formData).length > 0;
      const q1Type = typeof formData.q1;
      const q2CowsType = typeof formData.q2_cows;
      const q2CowsVal = formData.q2_cows;
      console.log("[summarize] request: hasFormData=%s, q1=%s, q2_cows=%s (%s)", hasFormData, q1Type, q2CowsType, q2CowsVal);
      if (hasFormData && (typeof formData.q2_cows === "string" || typeof formData.q2_hectares === "string")) {
        formData = {
          ...formData,
          q2_cows: typeof formData.q2_cows === "number" ? formData.q2_cows : parseInt(String(formData.q2_cows), 10) || 0,
          q2_hectares: typeof formData.q2_hectares === "number" ? formData.q2_hectares : parseInt(String(formData.q2_hectares), 10) || 0,
        } as Record<string, unknown>;
        console.log("[summarize] normalized q2_cows/q2_hectares to number");
      }
    }

    if (isRevise) {
      const revisePrompt = `Huidige samenvatting:\n\n${currentSummary}\n\nFeedback van de melkveehouder (wat zij willen aanpassen):\n${feedback}\n\nGeef de herziene samenvatting in dezelfde structuur (inleiding, ## Kernpunten met bullets, ## Voor het gesprek).`;

      const resp = await client.responses.create({
        model,
        ...(isReasoningModel && { reasoning: { effort: "medium" as const } }),
        max_output_tokens: 1200,
        input: [
          { role: "developer", content: REVISE_SYSTEM_PROMPT },
          { role: "user", content: revisePrompt },
        ],
      });

      const summary = (resp.output_text ?? "").trim();
      console.log("[summarize] revise success: summary length=%d", summary.length);
      return NextResponse.json({ summary });
    }

    if (!isUniveFormData(formData)) {
      console.log("[summarize] invalid formData: isUniveFormData=false");
      return NextResponse.json(
        { error: "Ongeldige formulierdata. Alleen Univé vragenlijst wordt ondersteund." },
        { status: 400 }
      );
    }

    const userPrompt = buildUniveSummaryInput(formData as UniveFormData);

    const resp = await client.responses.create({
      model,
      ...(isReasoningModel && { reasoning: { effort: "medium" as const } }),
      max_output_tokens: 1200,
      input: [
        { role: "developer", content: UNIVE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const summary = (resp.output_text ?? "").trim();
    console.log("[summarize] success: summary length=%d", summary.length);
    return NextResponse.json({ summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("summarize error:", message);
    return NextResponse.json(
      { error: "Samenvatting kon niet worden gegenereerd.", detail: message },
      { status: 500 }
    );
  }
}
