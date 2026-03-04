import { describe, it, expect } from "vitest";
import {
  buildUniveScreens,
  isUniveStepValid,
  isStepConditionallyHidden,
} from "./unive-screens";
import { normalizeFormData, UNIVE_INITIAL_FORM_DATA } from "./unive-questionnaire";
import type { UniveFormData } from "./unive-questionnaire";

describe("buildUniveScreens", () => {
  it("returns screens with expected ids including q6", () => {
    const screens = buildUniveScreens();
    const ids = screens.map((s) => s.id);
    expect(ids).toContain("q1");
    expect(ids).toContain("q6");
    expect(ids).toContain("q4a");
    expect(ids).toContain("q9");
    expect(ids).toContain("q19");
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

  it("q2 is invalid when both cows and hectares are 0", () => {
    const q2 = screens.find((s) => s.id === "q2")!;
    expect(isUniveStepValid(q2, UNIVE_INITIAL_FORM_DATA, false)).toBe(false);
    expect(isUniveStepValid(q2, normalizeFormData({ q2_cows: 1 }), false)).toBe(true);
    expect(isUniveStepValid(q2, normalizeFormData({ q2_hectares: 10 }), false)).toBe(true);
  });

  it("q8 is invalid when empty", () => {
    const q8 = screens.find((s) => s.id === "q8")!;
    expect(isUniveStepValid(q8, UNIVE_INITIAL_FORM_DATA, false)).toBe(false);
    expect(isUniveStepValid(q8, normalizeFormData({ q8: "Ja, meerdere" }), false)).toBe(true);
  });

  it("q9 is valid when q8 is not Ja (step skipped)", () => {
    const q9 = screens.find((s) => s.id === "q9")!;
    expect(isUniveStepValid(q9, normalizeFormData({ q8: "Nee" }), false)).toBe(true);
    expect(isUniveStepValid(q9, normalizeFormData({ q8: "Ja, meerdere", q9: [] }), false)).toBe(false);
    expect(isUniveStepValid(q9, normalizeFormData({ q8: "Ja, beperkt", q9: ["Financiële noodzaak"] }), false)).toBe(true);
  });

  it("handles malformed fd safely (q8 not string)", () => {
    const q8 = screens.find((s) => s.id === "q8")!;
    const fd = normalizeFormData({ q8: 123 });
    expect(isUniveStepValid(q8, fd, false)).toBe(false);
  });
});

describe("isStepConditionallyHidden", () => {
  it("q4a is hidden when q4 does not include Regelgeving", () => {
    expect(isStepConditionallyHidden("q4a", normalizeFormData({}))).toBe(true);
    expect(isStepConditionallyHidden("q4a", normalizeFormData({ q4: ["Melkprijs"] }))).toBe(true);
    expect(isStepConditionallyHidden("q4a", normalizeFormData({ q4: ["Regelgeving"] }))).toBe(false);
  });

  it("q9 is hidden when q8 is not Ja, meerdere/beperkt", () => {
    expect(isStepConditionallyHidden("q9", normalizeFormData({}))).toBe(true);
    expect(isStepConditionallyHidden("q9", normalizeFormData({ q8: "Nee" }))).toBe(true);
    expect(isStepConditionallyHidden("q9", normalizeFormData({ q8: "Ja, meerdere" }))).toBe(false);
    expect(isStepConditionallyHidden("q9", normalizeFormData({ q8: "Ja, beperkt" }))).toBe(false);
  });

  it("other steps are not conditionally hidden", () => {
    expect(isStepConditionallyHidden("q1", UNIVE_INITIAL_FORM_DATA)).toBe(false);
    expect(isStepConditionallyHidden("q6", UNIVE_INITIAL_FORM_DATA)).toBe(false);
  });
});
