import { NextResponse } from "next/server";
import { normalizeUniveFormData, generateUniveSummaryFromFormData } from "@/lib/summary-service";
import {
  buildSubmissionPayload,
  deliverSubmission,
  type UniveSubmissionPayload,
} from "@/lib/submission";

export const runtime = "nodejs";

type SubmitRequestBody = {
  formData?: unknown;
  summary?: string;
};

/**
 * POST /api/submit
 * Accepteert ingevulde antwoorden + gegenereerde samenvatting, bouwt het payload,
 * logt het en levert af (o.a. optionele webhook). Geschikt om later een CRM of
 * ander systeem op aan te sluiten.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SubmitRequestBody;
    const rawFormData = body.formData ?? {};

    if (!rawFormData || typeof rawFormData !== "object") {
      return NextResponse.json(
        { error: "Ongeldige formulierdata." },
        { status: 400 }
      );
    }

    const answers = normalizeUniveFormData(rawFormData);
    const rawSummary =
      typeof body.summary === "string" && body.summary.trim()
        ? body.summary.trim()
        : await generateUniveSummaryFromFormData(answers);

    const payload: UniveSubmissionPayload = buildSubmissionPayload(
      answers,
      rawSummary
    );

    const result = await deliverSubmission(payload);

    if (!result.ok) {
      return NextResponse.json(
        { error: "Doorsturen mislukt. De gegevens zijn wel gelogd.", detail: result.error },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      submissionId: payload.submissionId,
      submittedAt: payload.submittedAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[submit] error:", message);
    return NextResponse.json(
      { error: "Er ging iets mis bij het indienen." },
      { status: 500 }
    );
  }
}
