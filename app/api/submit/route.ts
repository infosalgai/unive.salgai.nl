import { NextResponse } from "next/server";
import { normalizeFormData } from "@/lib/unive-questionnaire";
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
    const rawSummary = body.summary;

    if (typeof rawSummary !== "string" || !rawSummary.trim()) {
      return NextResponse.json(
        { error: "Samenvatting ontbreekt." },
        { status: 400 }
      );
    }

    if (!rawFormData || typeof rawFormData !== "object") {
      return NextResponse.json(
        { error: "Ongeldige formulierdata." },
        { status: 400 }
      );
    }

    const answers = normalizeFormData(rawFormData);
    const payload: UniveSubmissionPayload = buildSubmissionPayload(
      answers,
      rawSummary.trim()
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
