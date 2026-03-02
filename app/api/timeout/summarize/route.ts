import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  isUniveFormData,
  buildUniveSummaryInput,
  type UniveFormData,
} from "@/lib/unive-questionnaire";

export const runtime = "nodejs";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

/** Univé: herschrijf samenvatting op basis van feedback (zelfde stijl, geen advies). */
const REVISE_SYSTEM_PROMPT = `Je bent een ervaren adviseur. De deelnemer heeft een samenvatting gekregen en geeft nu feedback over wat zij willen laten aanpassen. Je taak is om de samenvatting te herschrijven zodat de feedback erin is verwerkt. Behoud dezelfde stijl (herkenbaar, verbanden) en geef geen advies. De tekst blijft één samenhangend geheel, maximaal 500 woorden. Geen bulletlists of Markdown-koppen. Alleen de herziene samenvatting, geen toelichting.`;

/** Univé Vragenlijst Melkveehouders: samenvatting op basis van de ingevulde vragenlijst (geen PII). */
const UNIVE_SYSTEM_PROMPT = `Je bent een ervaren adviseur voor de agrarische sector. Je hebt de ingevulde vragenlijst van een melkveehouder ontvangen en schrijft nu een korte, herkenbare samenvatting van hun situatie en perspectief. Het doel is één doorlopend stuk waarin de deelnemer zich herkent: "dit is mijn verhaal."

REGELS
- Gebruik uitsluitend de informatie uit de input. Geen namen, bedrijfsnamen, locaties of herleidbare gegevens.
- Schrijf in vloeiende, doorlopende tekst. Geen bulletlists of Markdown-koppen. Geen cijfers of schalen letterlijk noemen (1–7 vertaal naar mensentaal).
- Leg verbanden tussen wat zij noemen: bedrijfsfase, zorgen, aanpassingen, verdienmodel, ondersteuning. Minimaal drie van zulke verbanden.
- Respectvol en niet-veroordelend. Maximaal 500 woorden. Alleen de samenvatting, geen advies of aanbevelingen.`;

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
    const currentSummary = typeof body?.currentSummary === "string" ? body.currentSummary.trim() : "";
    const feedback = typeof body?.feedback === "string" ? body.feedback.trim() : "";

    const isRevise = feedback.length > 0 && currentSummary.length > 0;

    if (isRevise) {
      const revisePrompt = `Hier is de huidige samenvatting:\n\n${currentSummary}\n\nFeedback van de deelnemer (wat zij willen aanpassen):\n${feedback}\n\nGeef de herziene samenvatting waarin deze feedback is verwerkt.`;

      const resp = await client.responses.create({
        model: "gpt-5.2",
        reasoning: { effort: "high" },
        max_output_tokens: 1800,
        input: [
          { role: "developer", content: REVISE_SYSTEM_PROMPT },
          { role: "user", content: revisePrompt },
        ],
      });

      const summary = (resp.output_text ?? "").trim();
      return Response.json({ summary });
    }

    if (!isUniveFormData(formData)) {
      return NextResponse.json(
        { error: "Ongeldige formulierdata. Alleen Univé vragenlijst wordt ondersteund." },
        { status: 400 }
      );
    }

    const userPrompt = buildUniveSummaryInput(formData as UniveFormData);

    const resp = await client.responses.create({
      model: "gpt-5.2",
      reasoning: { effort: "high" },
      max_output_tokens: 1800,
      input: [
        { role: "developer", content: UNIVE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const summary = (resp.output_text ?? "").trim();
    return Response.json({ summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("timeout/summarize error:", message);
    return new Response(
      JSON.stringify({ error: "Summarize failed", detail: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
