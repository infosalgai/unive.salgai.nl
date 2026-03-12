import { NextResponse } from "next/server";
import type { UniveFormData } from "@/lib/unive-questionnaire";
import {
  DEMO_SUMMARY,
  ensureNoPiiInFormData,
  generateUniveSummaryFromFormData,
  reviseUniveSummary,
} from "@/lib/summary-service";

export const runtime = "nodejs";

type SummarizeRequestBody = {
  formData?: unknown;
  currentSummary?: string;
  feedback?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SummarizeRequestBody;
    const currentSummary = typeof body.currentSummary === "string" ? body.currentSummary.trim() : "";
    const feedback = typeof body.feedback === "string" ? body.feedback.trim() : "";
    const isRevise = feedback.length > 0 && currentSummary.length > 0;

    if (isRevise) {
      const summary = await reviseUniveSummary(currentSummary, feedback);
      return NextResponse.json({ summary });
    }

    const rawFormData = body.formData ?? {};
    if (!rawFormData || typeof rawFormData !== "object") {
      return NextResponse.json(
        { error: "Ongeldige formulierdata. Alleen Univé vragenlijst wordt ondersteund." },
        { status: 400 }
      );
    }
    const summary = await generateUniveSummaryFromFormData(rawFormData);
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
    const isValidationError = status === 400;

    const userMessage = isQuotaError
      ? "Het quotum voor de AI-samenvatting is overschreden. Controleer je OpenAI-abonnement en facturatie, of probeer het later opnieuw."
      : isValidationError
        ? message
        : "Samenvatting kon niet worden gegenereerd.";

    return NextResponse.json({ error: userMessage }, { status });
  }
}
