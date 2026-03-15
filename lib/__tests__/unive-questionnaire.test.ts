import { describe, it, expect } from "vitest";
import {
  normalizeFormData,
  UNIVE_INITIAL_FORM_DATA,
  buildSequentialPayload,
} from "../unive-questionnaire";

describe("normalizeFormData", () => {
  it("returns full initial data when given null or undefined", () => {
    const a = normalizeFormData(null);
    const b = normalizeFormData(undefined);
    expect(a).toEqual(UNIVE_INITIAL_FORM_DATA);
    expect(b).toEqual(UNIVE_INITIAL_FORM_DATA);
  });

  it("returns full initial data when given empty object", () => {
    const out = normalizeFormData({});
    expect(out.q1).toBe("");
    expect(out.q6).toBe("");
    expect(Array.isArray(out.q4)).toBe(true);
    expect(out.q4).toEqual([]);
    expect(out.q5a).toBe(4);
    expect(out.q2_cows).toBe(0);
  });

  it("fills missing keys so q6 is never undefined (fixes client crash)", () => {
    const oldSchema = { q1: "Gangbaar", q2_cows: 50 } as unknown;
    const out = normalizeFormData(oldSchema);
    expect(out.q6).toBe("");
    expect(typeof out.q6).toBe("string");
    expect(out.q1).toBe("Gangbaar");
    expect(out.q2_cows).toBe(50);
  });

  it("coerces array fields to string arrays", () => {
    const out = normalizeFormData({
      q4: ["Regelgeving", 123, null, "Melkprijs"],
      q9: "not an array",
    } as unknown);
    expect(Array.isArray(out.q4)).toBe(true);
    expect(out.q4).toEqual(["Regelgeving", "Melkprijs"]);
    expect(Array.isArray(out.q9)).toBe(true);
    expect(out.q9).toEqual([]);
  });

  it("clamps scale fields to 1–7", () => {
    const out = normalizeFormData({
      q5a: 10,
      q7: 0,
      q12: -1,
    } as unknown);
    expect(out.q5a).toBe(7);
    expect(out.q7).toBe(1);
    expect(out.q12).toBe(1);
  });

  it("keeps q2_cows and q2_hectares as non-negative integers", () => {
    const out = normalizeFormData({
      q2_cows: 80,
      q2_hectares: 45.7,
    } as unknown);
    expect(out.q2_cows).toBe(80);
    expect(out.q2_hectares).toBe(45);
    const neg = normalizeFormData({ q2_cows: -1 } as unknown);
    expect(neg.q2_cows).toBe(0);
  });

  it("preserves valid string and number values", () => {
    const out = normalizeFormData({
      q1: "Biologisch",
      q3: "Ongeveer gelijk blijven",
      q6: "Mijn zorgen zijn groot",
      q8: "Ja, meerdere",
      q5a: 6,
    } as unknown);
    expect(out.q1).toBe("Biologisch");
    expect(out.q3).toBe("Ongeveer gelijk blijven");
    expect(out.q6).toBe("Mijn zorgen zijn groot");
    expect(out.q8).toBe("Ja, meerdere");
    expect(out.q5a).toBe(6);
  });
});

describe("buildSequentialPayload", () => {
  it("payload bevat alleen keys q1..q21 (zelfde nummering als URL ?stap=qN)", () => {
    const fd = normalizeFormData({
      q0_leeftijd: "30-39",
      q0_gemeente: "Test",
      q1: "Gangbaar",
      q2_cows: 80,
      q2_hectares: 50,
      q3: "Ongeveer gelijk blijven",
      q4: ["Melkprijs"],
      q6: "Zorgen",
      q10_kostenstructuur: 5,
      q11_duurzaamheid: "Ja",
      q11: ["Financiële middelen"],
      q5a: 5,
      q17a: 4,
      q17b_directe_verkoop: 3,
      q16a: ["Energieopwekking"],
      q15_waardevol: ["Kennis en advies"],
      q14_open_eenmalig: 4,
      q16_marge: 6,
      q19a: "Bedankt",
      q19_toestemming_contact: "Nee",
      q21_verloting: "Nee",
    } as unknown);
    const payload = buildSequentialPayload(fd);
    const keys = Object.keys(payload);
    expect(keys.every((k) => /^q(?:[1-9]|1\d|2[01])$/.test(k))).toBe(true);
    expect(keys).toContain("q1");
    expect(keys).toContain("q2");
    expect(payload.q1).toBe("30-39");
    expect(payload.q2).toBe("Test");
    expect(payload.q7).toBe("Zorgen");
  });
});
