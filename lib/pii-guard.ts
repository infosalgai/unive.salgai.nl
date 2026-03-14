/**
 * Lightweight client-side PII guard: heuristic detection of personal/identifiable data.
 * Used to show inline warning and block Next on open text fields.
 * No server-side logging of IP, user agent, or identifiers.
 */

const PATTERNS = {
  /** Simple email (local@domain.tld) */
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  /** Dutch/international phone (06-, +31, spaces/dashes) */
  phone: /(\+31|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}|\b06[\s-]?\d{8}\b|\b\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/g,
  /** URLs */
  url: /https?:\/\/[^\s]+|www\.[^\s]+/gi,
  /** Street + number (e.g. "Hoofdstraat 12", "Hoofdstraat 12a") */
  address: /\b([A-Za-z]+(\s+[A-Za-z]+)*)\s+(\d{1,5})\s*[a-zA-Z]?\b/g,
} as const

/** Placeholder used when redacting PII before sending data to external APIs. */
export const PII_REDACTED = "[verwijderd]"

export const PII_WARNING = "Geen namen of herleidbare gegevens invullen."

export interface PiiResult {
  hasPII: boolean
  /** Which pattern matched (for optional UX) */
  kind?: "email" | "phone" | "url" | "address"
}

/**
 * Returns whether the text contains likely PII (email, phone, URL, address-like).
 * Heuristic only; may have false positives/negatives.
 */
export function detectPii(text: string): PiiResult {
  const t = (text ?? "").trim()
  if (!t) return { hasPII: false }

  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(t)) return { hasPII: true, kind: "email" }
  if (/(\+31|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}|\b06[\s-]?\d{8}\b|\b\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/.test(t)) return { hasPII: true, kind: "phone" }
  if (/https?:\/\/[^\s]+|www\.[^\s]+/i.test(t)) return { hasPII: true, kind: "url" }
  if (/\b([A-Za-z]+(\s+[A-Za-z]+)*)\s+(\d{1,5})\s*[a-zA-Z]?\b/.test(t)) return { hasPII: true, kind: "address" }

  return { hasPII: false }
}

/**
 * Redacts likely PII from text by replacing matches with a placeholder.
 * Use before sending data to external APIs (e.g. OpenAI).
 */
export function redactPii(text: string): string {
  if (typeof text !== "string" || !text) return text
  let out = text
  out = out.replace(PATTERNS.email, PII_REDACTED)
  out = out.replace(PATTERNS.phone, PII_REDACTED)
  out = out.replace(PATTERNS.url, PII_REDACTED)
  out = out.replace(PATTERNS.address, PII_REDACTED)
  return out
}
