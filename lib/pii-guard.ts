/**
 * Lightweight client-side PII guard: heuristic detection of personal/identifiable data.
 * Used to show inline warning and block Next on open text fields.
 * No server-side logging of IP, user agent, or identifiers.
 */

const PATTERNS = {
  /** Simple email (local@domain.tld) */
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  /** Dutch/international phone (06-, +31, spaces/dashes) */
  phone: /(\+31|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}|\b06[\s-]?\d{8}\b|\b\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/,
  /** URLs */
  url: /https?:\/\/[^\s]+|www\.[^\s]+/i,
  /** Street + number (e.g. "Hoofdstraat 12", "Hoofdstraat 12a") */
  address: /\b([A-Za-z]+(\s+[A-Za-z]+)*)\s+(\d{1,5})\s*[a-zA-Z]?\b/,
} as const

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

  if (PATTERNS.email.test(t)) return { hasPII: true, kind: "email" }
  if (PATTERNS.phone.test(t)) return { hasPII: true, kind: "phone" }
  if (PATTERNS.url.test(t)) return { hasPII: true, kind: "url" }
  if (PATTERNS.address.test(t)) return { hasPII: true, kind: "address" }

  return { hasPII: false }
}
