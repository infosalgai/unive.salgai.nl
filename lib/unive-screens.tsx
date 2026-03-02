"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PiiTextarea } from "@/components/pii-textarea";
import type { UniveFormData } from "@/lib/unive-questionnaire";
import { UNIVE_TOTAL_QUESTIONS } from "@/lib/unive-questionnaire";

const QUESTION_LABEL_CLASS = "mb-2 block text-base font-semibold text-foreground";
const OPTION_ROW_CLASS =
  "flex items-center space-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5";
const HELPER_TEXT_CLASS = "text-xs text-muted-foreground";

/** Slider 1–7 met links/rechts labels en cijfers eronder */
function ScaleSlider({
  value,
  onValueChange,
  labelLeft,
  labelRight,
}: {
  value: number;
  onValueChange: (v: number) => void;
  labelLeft: string;
  labelRight: string;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap pr-1">{labelLeft}</span>
        <Slider
          value={[value]}
          onValueChange={([v]) => onValueChange(v)}
          min={1}
          max={7}
          step={1}
          className="w-full"
        />
        <span className="text-sm text-muted-foreground whitespace-nowrap pl-1 text-right">{labelRight}</span>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-3">
        <span aria-hidden />
        <div className="grid grid-cols-7 text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <span key={n} className="tabular-nums text-center">
              {n}
            </span>
          ))}
        </div>
        <span aria-hidden />
      </div>
    </div>
  );
}

// ── Options (exact Dutch wording) ──
const Q1_OPTIONS = [
  { id: "Gangbaar", label: "Gangbaar" },
  { id: "Biologisch", label: "Biologisch" },
  { id: "In omschakeling", label: "In omschakeling" },
  { id: "Anders", label: "Anders, namelijk:" },
];
const Q3_OPTIONS = [
  { id: "Groei", label: "Groei / uitbreiding" },
  { id: "Stabilisatie", label: "Stabilisatie" },
  { id: "Afschalen", label: "Afschalen" },
  { id: "Overdracht", label: "Overdracht binnen 10 jaar" },
  { id: "Onzeker", label: "Onzeker / nog geen duidelijke richting" },
];
const Q6_OPTIONS = [
  "Regelgeving",
  "Melkprijs",
  "Kosten (voer, energie, mest)",
  "Klimaat / weersomstandigheden",
  "Financiering / bank",
  "Maatschappelijke druk",
  "Opvolging",
  "Werkplezier",
  "Anders",
];
const Q8_OPTIONS = [
  { id: "Ja meerdere", label: "Ja, meerdere" },
  { id: "Ja beperkt", label: "Ja, beperkt" },
  { id: "Nee", label: "Nee" },
];
const Q9_OPTIONS = [
  "Financiële noodzaak",
  "Nieuwe regelgeving",
  "Risicospreiding",
  "Persoonlijke overtuiging",
  "Voorwaarden of advies vanuit bank/accountant/zuivel",
  "Niet van toepassing",
  "Anders",
];
const Q13_OPTIONS = [
  "Melkprijs",
  "Toeslagen/subsidies",
  "Grondwaarde",
  "Hoge vaste lasten",
  "Contractuele afspraken",
  "Anders",
];
const Q14_OPTIONS = [
  "Kostenstructuur",
  "Schaalgrootte",
  "Grondgebruik",
  "Samenwerking",
  "Afzet",
  "Diversificatie",
  "Weinig invloed",
  "Anders",
];
const Q15B_OPTIONS = [
  { id: "Ja concreet", label: "Ja, concreet" },
  { id: "Misschien", label: "Misschien, maar nog niet uitgewerkt" },
  { id: "Nee", label: "Nee, weinig mogelijkheden" },
  { id: "Weet ik niet", label: "Weet ik niet" },
];
const Q16_OPTIONS = [
  "Landschapselementen (bijv. houtwallen)",
  "Agroforestry / bomen met productie (bijv. noten of fruit)",
  "Andere teelten",
  "Extensiveren",
  "Samenwerking met derden",
  "Nieuwe verdienmodellen (bijv. vergoedingen voor koolstofvastlegging)",
  "Geen van bovenstaande",
  "Anders",
];
const Q17_OPTIONS = [
  "Onzeker rendement op korte termijn",
  "Onzeker rendement op lange termijn",
  "Investering te groot",
  "Onvoldoende kennis",
  "Te veel administratie",
  "Onzeker beleid",
  "Onvoldoende steun van bank",
  "Gebrek aan tijd",
  "Twijfel over praktische haalbaarheid",
  "Anders",
];
const Q19_OPTIONS = [
  "Ondersteuning bij initiële investering",
  "Structurele vergoeding",
  "Prijszekerheid",
  "Risicodekking bij tegenvallende opbrengst",
  "Doorrekening van het verdienmodel",
  "Praktische begeleiding",
  "Inhoudelijke kennis en advies",
  "Administratieve ontzorging",
  "Langjarige afspraken",
  "Samenwerking met andere partijen",
  "Anders",
];

export interface UniveScreen {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  questionNumber: number;
  choiceField?: keyof UniveFormData;
  multiChoiceField?: keyof UniveFormData;
  maxChoices?: number;
  required?: boolean;
  /** When true, step is invalid if PII is detected in its open text field(s). */
  hasPiiField?: boolean;
  render: (
    fd: UniveFormData,
    update: (p: Partial<UniveFormData>) => void,
    toggleMulti: (field: keyof UniveFormData, value: string, max?: number) => void,
    setPiiBlocked: (v: boolean) => void
  ) => React.ReactNode;
}

export function buildUniveScreens(): UniveScreen[] {
  const screens: UniveScreen[] = [];

  // Deel 1 – Uw bedrijf
  screens.push({
    id: "q1",
    group: "Deel 1 – Uw bedrijf",
    questionNumber: 1,
    title: "Wat typeert uw bedrijf het beste?",
    choiceField: "q1",
    render: (fd, update, _, setPiiBlocked) => (
      <>
        <RadioGroup value={fd.q1} onValueChange={(v) => update({ q1: v })} className="space-y-2">
          {Q1_OPTIONS.filter((o) => o.id !== "Anders").map((opt) => (
            <div key={opt.id} className={OPTION_ROW_CLASS}>
              <RadioGroupItem value={opt.id} id={`q1-${opt.id}`} />
              <Label htmlFor={`q1-${opt.id}`} className="flex-1 cursor-pointer text-sm font-medium">{opt.label}</Label>
            </div>
          ))}
          {Q1_OPTIONS.filter((o) => o.id === "Anders").map((opt) => (
            <div key={opt.id} className={OPTION_ROW_CLASS}>
              <RadioGroupItem value={opt.id} id={`q1-${opt.id}`} />
              <Label htmlFor={`q1-${opt.id}`} className="flex-1 cursor-pointer text-sm font-medium">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {fd.q1 === "Anders" && (
          <div className="mt-3">
            <Input
              value={fd.q1_anders}
              onChange={(e) => update({ q1_anders: e.target.value })}
              placeholder="Anders, namelijk"
              maxLength={200}
            />
          </div>
        )}
      </>
    ),
  });

  screens.push({
    id: "q2",
    group: "Deel 1 – Uw bedrijf",
    questionNumber: 2,
    title: "Hoe groot is uw bedrijf?",
    subtitle: "Geef aantallen (gehele getallen).",
    render: (fd, update) => (
      <div className="space-y-4">
        <div>
          <Label className={QUESTION_LABEL_CLASS}>Aantal melkkoeien</Label>
          <Input
            type="number"
            min={0}
            step={1}
            value={fd.q2_cows || ""}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              update({ q2_cows: Number.isFinite(v) && v >= 0 ? v : 0 });
            }}
            placeholder="0"
          />
        </div>
        <div>
          <Label className={QUESTION_LABEL_CLASS}>Aantal hectares landbouwgrond</Label>
          <Input
            type="number"
            min={0}
            step={1}
            value={fd.q2_hectares || ""}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              update({ q2_hectares: Number.isFinite(v) && v >= 0 ? v : 0 });
            }}
            placeholder="0"
          />
        </div>
      </div>
    ),
  });

  screens.push({
    id: "q3",
    group: "Deel 1 – Uw bedrijf",
    questionNumber: 3,
    title: "In welke fase bevindt uw bedrijf zich?",
    choiceField: "q3",
    render: (fd, update) => (
      <RadioGroup value={fd.q3} onValueChange={(v) => update({ q3: v })} className="space-y-2">
        {Q3_OPTIONS.map((opt) => (
          <div key={opt.id} className={OPTION_ROW_CLASS}>
            <RadioGroupItem value={opt.id} id={`q3-${opt.id}`} />
            <Label htmlFor={`q3-${opt.id}`} className="flex-1 cursor-pointer text-sm font-medium">{opt.label}</Label>
          </div>
        ))}
      </RadioGroup>
    ),
  });

  // Deel 2 – Huidige situatie en toekomstbeeld
  screens.push({
    id: "q4",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 4,
    title: "Hoe kijkt u op dit moment naar de toekomst van uw bedrijf?",
    render: (fd, update) => (
      <ScaleSlider
        value={fd.q4}
        onValueChange={(v) => update({ q4: v })}
        labelLeft="Zeer onzeker"
        labelRight="Veel vertrouwen"
      />
    ),
  });

  screens.push({
    id: "q5",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 5,
    title: "Wat zijn op dit moment uw grootste zorgen voor de komende 5–10 jaar?",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <PiiTextarea
        value={fd.q5}
        onChange={(v) => update({ q5: v })}
        onPiiChange={setPiiBlocked}
        placeholder="Uw antwoord"
        rows={4}
        maxLength={1000}
      />
    ),
  });

  screens.push({
    id: "q6",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 6,
    title: "Welke ontwikkelingen hebben de meeste invloed op uw bedrijfsvoering?",
    subtitle: "Kies maximaal 3.",
    multiChoiceField: "q6",
    maxChoices: 3,
    render: (fd, update, toggleMulti) => {
      const onToggle = (v: string) => toggleMulti("q6", v, 3);
      const selected = fd.q6;
      return (
        <div className="space-y-3">
          <p className={HELPER_TEXT_CLASS}>{selected.length}/3 gekozen</p>
          <div className="flex flex-wrap gap-2">
            {Q6_OPTIONS.map((opt) => {
              const isSelected = selected.includes(opt);
              const disabled = !isSelected && selected.length >= 3;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => !disabled && onToggle(opt)}
                  disabled={disabled}
                  className={`rounded-full border px-4 py-2 text-sm transition-all ${
                    isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/50"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {selected.includes("Anders") && (
            <div className="mt-3">
              <Label className={QUESTION_LABEL_CLASS}>Anders, namelijk:</Label>
              <Input
                value={fd.q6_anders}
                onChange={(e) => update({ q6_anders: e.target.value })}
                placeholder="Toelichting"
                maxLength={200}
              />
            </div>
          )}
        </div>
      );
    },
  });

  screens.push({
    id: "q7",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 7,
    title: "In hoeverre heeft u het gevoel zelf invloed te hebben op de toekomst van uw bedrijf?",
    render: (fd, update) => (
      <ScaleSlider
        value={fd.q7}
        onValueChange={(v) => update({ q7: v })}
        labelLeft="Nauwelijks invloed"
        labelRight="Veel invloed"
      />
    ),
  });

  // Deel 3 – Veranderingen in bedrijfsvoering (q8 + q9 op één pagina; q9 alleen bij Ja meerdere/beperkt)
  screens.push({
    id: "q8",
    group: "Deel 3 – Veranderingen in bedrijfsvoering",
    questionNumber: 8,
    title: "Heeft u de afgelopen 5 jaar aanpassingen gedaan in uw bedrijfsvoering?",
    choiceField: "q8",
    multiChoiceField: "q9",
    maxChoices: 2,
    hasPiiField: true,
    render: (fd, update, toggleMulti, setPiiBlocked) => (
      <div className="space-y-6">
        <RadioGroup value={fd.q8} onValueChange={(v) => update({ q8: v })} className="space-y-2">
          {Q8_OPTIONS.map((opt) => (
            <div key={opt.id} className={OPTION_ROW_CLASS}>
              <RadioGroupItem value={opt.id} id={`q8-${opt.id}`} />
              <Label htmlFor={`q8-${opt.id}`} className="flex-1 cursor-pointer text-sm font-medium">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {(fd.q8 === "Ja meerdere" || fd.q8 === "Ja beperkt") && (
          <>
            <div>
              <Label className={QUESTION_LABEL_CLASS}>Kunt u kort aangeven welke aanpassingen dit waren?</Label>
              <PiiTextarea
                value={fd.q8a}
                onChange={(v) => update({ q8a: v })}
                onPiiChange={setPiiBlocked}
                placeholder="Max 2–3 regels"
                rows={3}
                maxLength={500}
              />
            </div>
            <div>
              <Label className={QUESTION_LABEL_CLASS}>Wat waren de belangrijkste aanleidingen voor deze aanpassingen?</Label>
              <p className={HELPER_TEXT_CLASS}>Kies maximaal 2.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Q9_OPTIONS.map((opt) => {
                  const isSelected = fd.q9.includes(opt);
                  const disabled = !isSelected && fd.q9.length >= 2;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => !disabled && toggleMulti("q9", opt, 2)}
                      disabled={disabled}
                      className={`rounded-full border px-4 py-2 text-sm ${isSelected ? "border-primary bg-primary/10" : "border-border"} ${disabled ? "opacity-50" : ""}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {fd.q9.includes("Anders") && (
                <div className="mt-3">
                  <Label className={QUESTION_LABEL_CLASS}>Anders, namelijk:</Label>
                  <Input value={fd.q9_anders} onChange={(e) => update({ q9_anders: e.target.value })} maxLength={200} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    ),
  });

  screens.push({
    id: "q10",
    group: "Deel 3 – Veranderingen in bedrijfsvoering",
    questionNumber: 9,
    title: "Wat zou voor u een concrete aanleiding zijn om (opnieuw) aanpassingen te doen?",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <PiiTextarea value={fd.q10} onChange={(v) => update({ q10: v })} onPiiChange={setPiiBlocked} rows={4} maxLength={1000} />
    ),
  });

  // Deel 4 – Verdienmodel en kwetsbaarheden
  screens.push({
    id: "q11",
    group: "Deel 4 – Verdienmodel en kwetsbaarheden",
    questionNumber: 10,
    title: "Hoe beoordeelt u de stabiliteit van uw huidige verdienmodel?",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <div className="space-y-4">
        <ScaleSlider
          value={fd.q11}
          onValueChange={(v) => update({ q11: v })}
          labelLeft="Zeer kwetsbaar"
          labelRight="Zeer stabiel"
        />
        <div>
          <Label className={QUESTION_LABEL_CLASS}>Optioneel: toelichting</Label>
          <PiiTextarea value={fd.q11_toelichting} onChange={(v) => update({ q11_toelichting: v })} onPiiChange={setPiiBlocked} rows={2} maxLength={300} />
        </div>
      </div>
    ),
  });

  screens.push({
    id: "q12",
    group: "Deel 4 – Verdienmodel en kwetsbaarheden",
    questionNumber: 11,
    title: "Waar zit volgens u de grootste kwetsbaarheid in uw verdienmodel?",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <PiiTextarea value={fd.q12} onChange={(v) => update({ q12: v })} onPiiChange={setPiiBlocked} rows={4} maxLength={1000} />
    ),
  });

  screens.push({
    id: "q13",
    group: "Deel 4 – Verdienmodel en kwetsbaarheden",
    questionNumber: 12,
    title: "Waar is uw bedrijf financieel het meest afhankelijk van?",
    subtitle: "Kies maximaal 3.",
    multiChoiceField: "q13",
    maxChoices: 3,
    render: (fd, update, toggleMulti) => (
      <div className="space-y-3">
        <p className={HELPER_TEXT_CLASS}>{fd.q13.length}/3 gekozen</p>
        <div className="flex flex-wrap gap-2">
          {Q13_OPTIONS.map((opt) => {
            const isSelected = fd.q13.includes(opt);
            const disabled = !isSelected && fd.q13.length >= 3;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => !disabled && toggleMulti("q13", opt, 3)}
                disabled={disabled}
                className={`rounded-full border px-4 py-2 text-sm ${isSelected ? "border-primary bg-primary/10" : "border-border"} ${disabled ? "opacity-50" : ""}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {fd.q13.includes("Anders") && (
          <div className="mt-3">
            <Input value={fd.q13_anders} onChange={(e) => update({ q13_anders: e.target.value })} placeholder="Anders, namelijk" maxLength={200} />
          </div>
        )}
      </div>
    ),
  });

  screens.push({
    id: "q14",
    group: "Deel 4 – Verdienmodel en kwetsbaarheden",
    questionNumber: 13,
    title: "Op welke onderdelen van uw bedrijfsvoering ervaart u ruimte om zelf te sturen?",
    subtitle: "Meerdere antwoorden mogelijk.",
    multiChoiceField: "q14",
    render: (fd, update, toggleMulti) => (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {Q14_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleMulti("q14", opt)}
              className={`rounded-full border px-4 py-2 text-sm ${fd.q14.includes(opt) ? "border-primary bg-primary/10" : "border-border"}`}
            >
              {opt}
            </button>
          ))}
        </div>
        {fd.q14.includes("Anders") && (
          <div className="mt-3">
            <Input value={fd.q14_anders} onChange={(e) => update({ q14_anders: e.target.value })} placeholder="Anders, namelijk" maxLength={200} />
          </div>
        )}
      </div>
    ),
  });

  screens.push({
    id: "q15a",
    group: "Deel 4 – Verdienmodel en kwetsbaarheden",
    questionNumber: 14,
    title: "In hoeverre heeft u behoefte aan aanvullende inkomsten of meer risicospreiding?",
    render: (fd, update) => (
      <ScaleSlider
        value={fd.q15a}
        onValueChange={(v) => update({ q15a: v })}
        labelLeft="Geen behoefte"
        labelRight="Sterke behoefte"
      />
    ),
  });

  screens.push({
    id: "q15b",
    group: "Deel 4 – Verdienmodel en kwetsbaarheden",
    questionNumber: 15,
    title: "Ziet u mogelijkheden om uw inkomsten te verbreden of risico's te spreiden?",
    choiceField: "q15b",
    render: (fd, update) => (
      <RadioGroup value={fd.q15b} onValueChange={(v) => update({ q15b: v })} className="space-y-2">
        {Q15B_OPTIONS.map((opt) => (
          <div key={opt.id} className={OPTION_ROW_CLASS}>
            <RadioGroupItem value={opt.id} id={`q15b-${opt.id}`} />
            <Label htmlFor={`q15b-${opt.id}`} className="flex-1 cursor-pointer text-sm font-medium">{opt.label}</Label>
          </div>
        ))}
      </RadioGroup>
    ),
  });

  screens.push({
    id: "q16",
    group: "Deel 4 – Verdienmodel en kwetsbaarheden",
    questionNumber: 16,
    title: "Welke vormen van verbreding of aanpassing zou u overwegen?",
    subtitle: "Meerdere antwoorden mogelijk.",
    multiChoiceField: "q16",
    render: (fd, update, toggleMulti) => (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {Q16_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleMulti("q16", opt)}
              className={`rounded-full border px-4 py-2 text-sm ${fd.q16.includes(opt) ? "border-primary bg-primary/10" : "border-border"}`}
            >
              {opt}
            </button>
          ))}
        </div>
        {fd.q16.includes("Anders") && (
          <div className="mt-3">
            <Input value={fd.q16_anders} onChange={(e) => update({ q16_anders: e.target.value })} placeholder="Anders, namelijk" maxLength={200} />
          </div>
        )}
      </div>
    ),
  });

  // Deel 5 – Wat houdt u tegen?
  screens.push({
    id: "q17",
    group: "Deel 5 – Wat houdt u tegen?",
    questionNumber: 17,
    title: "Wat houdt u het meest tegen om aanpassingen te doen?",
    subtitle: "Kies maximaal 3.",
    multiChoiceField: "q17",
    maxChoices: 3,
    render: (fd, update, toggleMulti) => (
      <div className="space-y-3">
        <p className={HELPER_TEXT_CLASS}>{fd.q17.length}/3 gekozen</p>
        <div className="flex flex-wrap gap-2">
          {Q17_OPTIONS.map((opt) => {
            const isSelected = fd.q17.includes(opt);
            const disabled = !isSelected && fd.q17.length >= 3;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => !disabled && toggleMulti("q17", opt, 3)}
                disabled={disabled}
                className={`rounded-full border px-4 py-2 text-sm ${isSelected ? "border-primary bg-primary/10" : "border-border"} ${disabled ? "opacity-50" : ""}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {fd.q17.includes("Anders") && (
          <div className="mt-3">
            <Input value={fd.q17_anders} onChange={(e) => update({ q17_anders: e.target.value })} placeholder="Anders, namelijk" maxLength={200} />
          </div>
        )}
      </div>
    ),
  });

  screens.push({
    id: "q18",
    group: "Deel 5 – Wat houdt u tegen?",
    questionNumber: 18,
    title: "In hoeverre speelt financiering een rol in uw afweging om te veranderen?",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <div className="space-y-4">
        <ScaleSlider
          value={fd.q18}
          onValueChange={(v) => update({ q18: v })}
          labelLeft="Speelt geen rol"
          labelRight="Doorslaggevend"
        />
        <div>
          <Label className={QUESTION_LABEL_CLASS}>Optioneel: toelichting</Label>
          <PiiTextarea value={fd.q18_toelichting} onChange={(v) => update({ q18_toelichting: v })} onPiiChange={setPiiBlocked} rows={2} maxLength={300} />
        </div>
      </div>
    ),
  });

  // Deel 6 – Welke ondersteuning zou helpen?
  screens.push({
    id: "q19",
    group: "Deel 6 – Welke ondersteuning zou helpen?",
    questionNumber: 19,
    title: "Welke vormen van ondersteuning zouden voor u het meest waardevol zijn?",
    subtitle: "Kies maximaal 3.",
    multiChoiceField: "q19",
    maxChoices: 3,
    render: (fd, update, toggleMulti) => (
      <div className="space-y-3">
        <p className={HELPER_TEXT_CLASS}>{fd.q19.length}/3 gekozen</p>
        <div className="flex flex-wrap gap-2">
          {Q19_OPTIONS.map((opt) => {
            const isSelected = fd.q19.includes(opt);
            const disabled = !isSelected && fd.q19.length >= 3;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => !disabled && toggleMulti("q19", opt, 3)}
                disabled={disabled}
                className={`rounded-full border px-4 py-2 text-sm ${isSelected ? "border-primary bg-primary/10" : "border-border"} ${disabled ? "opacity-50" : ""}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {fd.q19.includes("Anders") && (
          <div className="mt-3">
            <Input value={fd.q19_anders} onChange={(e) => update({ q19_anders: e.target.value })} placeholder="Anders, namelijk" maxLength={200} />
          </div>
        )}
      </div>
    ),
  });

  screens.push({
    id: "q20",
    group: "Deel 6 – Welke ondersteuning zou helpen?",
    questionNumber: 20,
    title: "Onder welke voorwaarden zou u openstaan voor het aanleggen van houtwallen?",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <PiiTextarea value={fd.q20} onChange={(v) => update({ q20: v })} onPiiChange={setPiiBlocked} rows={4} maxLength={1000} />
    ),
  });

  screens.push({
    id: "q21",
    group: "Deel 6 – Welke ondersteuning zou helpen?",
    questionNumber: 21,
    title: "Onder welke voorwaarden zou u openstaan voor het inpassen van bomen met productie (bijv. noten of fruit) in uw bedrijfsvoering?",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <PiiTextarea value={fd.q21} onChange={(v) => update({ q21: v })} onPiiChange={setPiiBlocked} rows={4} maxLength={1000} />
    ),
  });

  // Deel 7 – Afsluiting
  screens.push({
    id: "q22-q23",
    group: "Deel 7 – Afsluiting",
    questionNumber: 22,
    title: "Afsluiting",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <div className="space-y-6">
        <div>
          <Label className={QUESTION_LABEL_CLASS}>Wat zou u, als u volledig vrij kon kiezen, het liefst aanpassen aan uw huidige bedrijfsvoering?</Label>
          <PiiTextarea value={fd.q22} onChange={(v) => update({ q22: v })} onPiiChange={setPiiBlocked} rows={3} maxLength={800} />
        </div>
        <hr className="border-border" />
        <div>
          <Label className={QUESTION_LABEL_CLASS}>Wat moeten partijen zoals verzekeraars beter begrijpen van de praktijk op uw erf?</Label>
          <PiiTextarea value={fd.q23} onChange={(v) => update({ q23: v })} onPiiChange={setPiiBlocked} rows={3} maxLength={800} />
        </div>
        <div>
          <Label className={QUESTION_LABEL_CLASS}>Optioneel: aanvullende opmerkingen</Label>
          <PiiTextarea value={fd.q_opmerkingen} onChange={(v) => update({ q_opmerkingen: v })} onPiiChange={setPiiBlocked} rows={2} maxLength={500} />
        </div>
      </div>
    ),
  });

  return screens;
}

export function isUniveStepValid(screen: UniveScreen, fd: UniveFormData, piiBlocked: boolean): boolean {
  if (piiBlocked && screen.hasPiiField) return false;
  if (screen.required === false) return true;
  if (screen.id === "q2") {
    return fd.q2_cows > 0 || fd.q2_hectares > 0;
  }
  if (screen.id === "q8") {
    const q8 = typeof fd.q8 === "string" ? fd.q8.trim() : "";
    if (!q8) return false;
    const showQ9 = q8 === "Ja meerdere" || q8 === "Ja beperkt";
    if (showQ9) {
      const q9 = (fd.q9 as string[]) ?? [];
      if (q9.length === 0) return false;
    }
    return true;
  }
  if (screen.choiceField) {
    const val = fd[screen.choiceField];
    const str = typeof val === "string" ? val.trim() : "";
    if (!str) return false;
  }
  if (screen.multiChoiceField && screen.maxChoices !== undefined) {
    const arr = fd[screen.multiChoiceField] as string[];
    if (!Array.isArray(arr)) return true; // optional
  }
  return true;
}

export { UNIVE_TOTAL_QUESTIONS };
