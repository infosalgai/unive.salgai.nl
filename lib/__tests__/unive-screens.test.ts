import { describe, it, expect } from "vitest";
import {
  buildUniveScreens,
  isUniveStepValid,
  isStepConditionallyHidden,
} from "../unive-screens";
import { normalizeFormData, UNIVE_INITIAL_FORM_DATA } from "../unive-questionnaire";
import type { UniveFormData } from "../unive-questionnaire";

describe("buildUniveScreens", () => {
  it("returns screens with expected ids and opeenvolgende stepNumber (q1, q2, …)", () => {
    const screens = buildUniveScreens();
    const ids = screens.map((s) => s.id);
    expect(ids[0]).toBe("q0_leeftijd");
    expect(ids).toContain("q1");
    expect(ids).toContain("q6");
    expect(ids).toContain("q4a");
    expect(ids).toContain("q19");
    const steps = screens.map((s) => s.stepNumber);
    expect(steps[0]).toBe(1);
    expect(steps).toContain(2);
    expect(Math.max(...steps)).toBe(21);
  });

  it("q0_leeftijd is invalid when empty", () => {
    const screens = buildUniveScreens();
    const q0 = screens.find((s) => s.id === "q0_leeftijd")!;
    expect(isUniveStepValid(q0, UNIVE_INITIAL_FORM_DATA, false)).toBe(false);
    expect(isUniveStepValid(q0, normalizeFormData({ q0_leeftijd: "Jonger dan 30" }), false)).toBe(true);
  });

  it("every screen has render that accepts normalized formData without throwing", () => {
    const screens = buildUniveScreens();
    const fd = normalizeFormData(null);
    const noop = () => {};
    const update = noop as (p: Partial<UniveFormData>) => void;
    const toggleMulti = noop as (field: keyof UniveFormData, value: string, max?: number) => void;
    const setPiiBlocked = noop as (v: boolean) => void;
    for (const screen of screens) {
      expect(() => {
        screen.render(fd, update, toggleMulti, setPiiBlocked);
      }).not.toThrow();
    }
  });
});

describe("isUniveStepValid", () => {
  const screens = buildUniveScreens();

  it("q2 is invalid when both cows and hectares are 0; both must be > 0", () => {
    const q2 = screens.find((s) => s.id === "q2")!;
    expect(isUniveStepValid(q2, UNIVE_INITIAL_FORM_DATA, false)).toBe(false);
    expect(isUniveStepValid(q2, normalizeFormData({ q2_cows: 1 }), false)).toBe(false);
    expect(isUniveStepValid(q2, normalizeFormData({ q2_hectares: 10 }), false)).toBe(false);
    expect(isUniveStepValid(q2, normalizeFormData({ q2_cows: 50, q2_hectares: 30 }), false)).toBe(true);
  });

  it("q4 is invalid when empty", () => {
    const q4 = screens.find((s) => s.id === "q4")!;
    expect(isUniveStepValid(q4, UNIVE_INITIAL_FORM_DATA, false)).toBe(false);
    expect(isUniveStepValid(q4, normalizeFormData({ q4: ["Regelgeving"], q4a: ["Stikstof- en vergunningenproblematiek"] }), false)).toBe(true);
  });

  it("handles malformed fd safely (q4 not array)", () => {
    const q4 = screens.find((s) => s.id === "q4")!;
    const fd = normalizeFormData({ q4: "Regelgeving" });
    expect(isUniveStepValid(q4, fd, false)).toBe(false);
  });
});

describe("isStepConditionallyHidden", () => {
  it("q4a is always hidden (regelgeving-doorvraag is inlined on q4)", () => {
    expect(isStepConditionallyHidden("q4a", normalizeFormData({}))).toBe(true);
    expect(isStepConditionallyHidden("q4a", normalizeFormData({ q4: ["Regelgeving"] }))).toBe(true);
  });

  it("q9 is hidden when q8 is not Ja, meerdere/beperkt", () => {
    expect(isStepConditionallyHidden("q9", normalizeFormData({}))).toBe(true);
    expect(isStepConditionallyHidden("q9", normalizeFormData({ q8: "Nee" }))).toBe(true);
    expect(isStepConditionallyHidden("q9", normalizeFormData({ q8: "Ja, meerdere" }))).toBe(false);
    expect(isStepConditionallyHidden("q9", normalizeFormData({ q8: "Ja, beperkt" }))).toBe(false);
  });

  it("q11b is hidden when no Ja in matrix (vraag 11); q11 (wat houdt tegen) is always visible", () => {
    const noJa = normalizeFormData({
      q11_duurzaamheid: "Nee",
      q11_bedrijfsschaal: "Nee",
      q11_bedrijfsvoering: "Nee",
      q11_verdienmodel: "Nee",
      q11_investeringen: "Nee",
    });
    expect(isStepConditionallyHidden("q11b", noJa)).toBe(true);
    expect(isStepConditionallyHidden("q11", noJa)).toBe(false);
    const oneJa = normalizeFormData({ ...noJa, q11_duurzaamheid: "Ja" });
    expect(isStepConditionallyHidden("q11b", oneJa)).toBe(false);
  });

  it("other steps are not conditionally hidden", () => {
    expect(isStepConditionallyHidden("q1", UNIVE_INITIAL_FORM_DATA)).toBe(false);
    expect(isStepConditionallyHidden("q6", UNIVE_INITIAL_FORM_DATA)).toBe(false);
  });
});
