import { describe, it, expect } from "vitest";
import {
  normalizeFormData,
  UNIVE_INITIAL_FORM_DATA,
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
      q3: "Stabilisatie",
      q6: "Mijn zorgen zijn groot",
      q8: "Ja, meerdere",
      q5a: 6,
    } as unknown);
    expect(out.q1).toBe("Biologisch");
    expect(out.q3).toBe("Stabilisatie");
    expect(out.q6).toBe("Mijn zorgen zijn groot");
    expect(out.q8).toBe("Ja, meerdere");
    expect(out.q5a).toBe(6);
  });
});
