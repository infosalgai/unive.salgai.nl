/**
 * Univé vragenlijst – submission payload en delivery.
 * Data wordt gelogd en "klaargezet" zodat een extern systeem (CRM, webhook, etc.)
 * later eenvoudig gekoppeld kan worden.
 */

import type { UniveFormData } from "@/lib/unive-questionnaire";
import { buildSequentialPayload } from "@/lib/unive-questionnaire";

/** Huidige versie van het payload-schema (bij wijzigingen verhogen voor compatibiliteit). */
export const SUBMISSION_PAYLOAD_VERSION = "1.0";

export interface UniveSubmissionPayload {
  /** Schema-versie voor toekomstige compatibiliteit. */
  version: string;
  /** Tijdstip van indienen (ISO 8601). */
  submittedAt: string;
  /** Unieke id voor deze indiening (voor logging en eventuele idempotency). */
  submissionId: string;
  /** Alle ingevulde antwoorden van de vragenlijst (ruwe form keys). */
  answers: UniveFormData;
  /** Antwoorden per vraag q1, q2, … met alleen antwoordtekst/label (zelfde nummering als URL). Geen tooltips. */
  answersSequential: Record<string, string>;
  /** Gegenereerde samenvatting (lopende tekst). */
  summary: string;
}

/**
 * Bouwt het standaard payload-object voor een indiening.
 * Gebruik dit overal waar data naar een extern systeem moet (API, log, webhook).
 * answersSequential bevat q1, q2, … met antwoordomschrijving (zelfde nummering als URL).
 */
export function buildSubmissionPayload(
  answers: UniveFormData,
  summary: string
): UniveSubmissionPayload {
  return {
    version: SUBMISSION_PAYLOAD_VERSION,
    submittedAt: new Date().toISOString(),
    submissionId: crypto.randomUUID(),
    answers,
    answersSequential: buildSequentialPayload(answers),
    summary: summary.trim(),
  };
}

export type DeliveryResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Logt het payload gestructureerd naar de server-console.
 * Handig voor debugging en om in de toekomst naar een log-aggregator te sturen.
 */
function logSubmission(payload: UniveSubmissionPayload): void {
  const { submissionId, submittedAt, version, summary, answers } = payload;
  const {
    q19_toestemming_contact,
    q19_naam,
    q19_email,
    q19_telefoon,
  } = answers;

  const logLine = {
    event: "unive_submission",
    submissionId,
    submittedAt,
    version,
    summaryLength: summary.length,
    contact: {
      toestemming_contact: q19_toestemming_contact,
      hasNaam: Boolean(q19_naam && q19_naam.trim()),
      hasEmail: Boolean(q19_email && q19_email.trim()),
      hasTelefoon: Boolean(q19_telefoon && q19_telefoon.trim()),
    },
  };
  console.info("[unive-submit]", JSON.stringify(logLine));
}

/**
 * Payload voor de webhook: alleen antwoorden als q1, q2, q3 … (labeltekst),
 * geen ruwe form keys en geen tooltips.
 */
export interface UniveWebhookPayload {
  version: string;
  submittedAt: string;
  submissionId: string;
  /** Antwoorden per vraag: q1 = "Jonger dan 30", q2 = "Súdwest-Fryslân", q3 = "Gangbaar", etc. Alleen antwoordtekst, geen tooltips. */
  answers: Record<string, string>;
  summary: string;
}

/**
 * Optionele webhook: als SUBMISSION_WEBHOOK_URL is gezet, wordt daar alleen
 * het webhook-payload gestuurd (q1, q2, q3 … + metadata + summary). Geen ruwe answers, geen tooltips.
 */
async function sendToWebhook(payload: UniveSubmissionPayload): Promise<DeliveryResult> {
  const url = process.env.SUBMISSION_WEBHOOK_URL;
  if (!url || typeof url !== "string" || !url.startsWith("https://")) {
    return { ok: true };
  }
  const webhookBody: UniveWebhookPayload = {
    version: payload.version,
    submittedAt: payload.submittedAt,
    submissionId: payload.submissionId,
    answers: payload.answersSequential,
    summary: payload.summary,
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookBody),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Webhook ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

/**
 * Levert een indiening af: logt altijd, en stuurt naar webhook als geconfigureerd.
 * Voeg hier later eventueel andere "delivery" backends toe (CRM, queue, etc.).
 */
export async function deliverSubmission(payload: UniveSubmissionPayload): Promise<DeliveryResult> {
  logSubmission(payload);

  const webhookResult = await sendToWebhook(payload);
  if (!webhookResult.ok) {
    console.error("[unive-submit] webhook failed:", webhookResult.error);
    return webhookResult;
  }

  return { ok: true };
}
