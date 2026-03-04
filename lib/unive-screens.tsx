"use client";

import React from "react";
import { Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PiiTextarea } from "@/components/pii-textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { UniveFormData } from "@/lib/unive-questionnaire";

const QUESTION_LABEL_CLASS = "mb-2 block text-base font-semibold text-foreground";

/** Toont een term met een klein info-icoon; bij hover verschijnt uitleg voor de melkveehouder. */
function TermWithTooltip({ term, explanation }: { term: string; explanation: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{term}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex shrink-0 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Uitleg: ${term}`}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px]">
          <p className="text-left">{explanation}</p>
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
const OPTION_ROW_CLASS =
  "flex items-center space-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5";
const HELPER_TEXT_CLASS = "text-xs text-muted-foreground";

/** Schaal 1–7: eerst de balk, daaronder de uitleg (links/rechts) en de cijfers 1–7 */
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
      <Slider
        value={[value]}
        onValueChange={([v]) => onValueChange(v)}
        min={1}
        max={7}
        step={1}
        className="w-full"
      />
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm text-muted-foreground">
        <span className="whitespace-nowrap pr-1">{labelLeft}</span>
        <div className="grid grid-cols-7 text-xs">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <span key={n} className="tabular-nums text-center">
              {n}
            </span>
          ))}
        </div>
        <span className="whitespace-nowrap pl-1 text-right">{labelRight}</span>
      </div>
    </div>
  );
}

/** Eén rij: label, dan balk 1–7, daaronder cijfers 1–7 (voor meerdere sliders op één scherm) */
function SliderRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: number;
  onValueChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Slider
            value={[value]}
            onValueChange={([v]) => onValueChange(v)}
            min={1}
            max={7}
            step={1}
            className="flex-1"
          />
          <span className="w-6 shrink-0 tabular-nums text-sm text-muted-foreground" aria-hidden>
            {value}
          </span>
        </div>
        <div className="grid grid-cols-7 text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <span key={n} className="tabular-nums text-center">
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Opties (exacte Nederlandse formulering conform nieuwe vragenlijst) ──
const Q1_OPTIONS = [
  { id: "Gangbaar", label: "Gangbaar" },
  { id: "Natuurinclusief", label: "Natuurinclusief" },
  { id: "Biologisch", label: "Biologisch" },
  { id: "In omschakeling", label: "In omschakeling" },
  { id: "Anders", label: "Anders, namelijk:" },
];

const Q3_OPTIONS = [
  { id: "Groei / uitbreiding", label: "Groei / uitbreiding" },
  { id: "Stabilisatie", label: "Stabilisatie" },
  { id: "Afschalen", label: "Afschalen" },
  { id: "Overdracht binnen 10 jaar", label: "Overdracht binnen 10 jaar" },
  { id: "Onzeker / nog geen duidelijke richting", label: "Onzeker / nog geen duidelijke richting" },
];

const Q4_OPTIONS = [
  "Regelgeving",
  "Melkprijs",
  "Kosten (voer, energie, mest)",
  "Klimaatverandering / extreme weersomstandigheden",
  "Herstel van biodiversiteit",
  "Financiering / bank",
  "Maatschappelijke druk",
  "Opvolging",
  "Werkplezier",
  "Gebiedsgerichte aanpak / uitkoopregelingen",
  "Anders, namelijk:",
];

const Q4A_OPTIONS = [
  "Stikstof- en vergunningenproblematiek",
  "Natura2000 / ligging nabij natuurgebied",
  "Mestbeleid en mestplaatsingsruimte",
  "Fosfaatrechten",
  "Afbouw derogatie / nitraateisen",
  "Klimaat- en broeikasgasbeleid",
  "Dierwelzijns- en stalregelgeving",
  "Waterkwaliteitseisen (KRW)",
  "Anders, namelijk:",
];

const Q8_OPTIONS = [
  { id: "Ja, meerdere", label: "Ja, meerdere grote of verschillende aanpassingen" },
  { id: "Ja, beperkt", label: "Ja, beperkte of enkele aanpassingen" },
  { id: "Nee", label: "Nee, nog geen aanpassingen gedaan" },
  { id: "Weet ik niet", label: "Weet ik niet / moeilijk in te schatten" },
];

const Q9_OPTIONS = [
  "Financiële noodzaak",
  "Nieuwe regelgeving",
  "Persoonlijke overtuiging",
  "Anders, namelijk:",
];

const Q11_OPTIONS = [
  "Onzeker rendement",
  "Investeringsmogelijkheden",
  "Onvoldoende kennis",
  "Onzeker beleid",
  "Onvoldoende steun van bank",
  "Twijfel over praktische haalbaarheid",
  "Anders, namelijk:",
];

const Q14_OPTIONS = [
  "Landschapselementen als houtwallen",
  "Agroforestry",
  "Teelten als hennep",
  "Productief kruidenrijk grasland",
  "Biobased bouwen",
  "Anders, namelijk:",
];

const Q15B_OPTIONS = [
  { id: "Ja, concreet", label: "Ja, concreet" },
  { id: "Misschien, maar nog niet uitgewerkt", label: "Misschien, maar nog niet uitgewerkt" },
  { id: "Nee, weinig mogelijkheden", label: "Nee, weinig mogelijkheden" },
  { id: "Weet ik niet", label: "Weet ik niet" },
];

const Q16_OPTIONS = [
  "Voldoende marge per jaar",
  "Lage schuldenlast",
  "Continuïteit voor volgende generatie",
  "Stabiliteit / weinig schommelingen",
  "Bedrijf in huidige vorm kunnen voortzetten",
  "Waardebehoud van grond en bedrijf",
  "Anders, namelijk:",
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

  // Deel 1 – Je bedrijf
  screens.push({
    id: "q1",
    group: "Deel 1 – Je bedrijf",
    questionNumber: 1,
    title: "Wat typeert je bedrijf het beste?",
    subtitle: "Denk aan je manier van boeren: gangbaar, biologisch of natuurinclusief. Kies het type dat het best past.",
    choiceField: "q1",
    render: (fd, update, _, setPiiBlocked) => {
      const q1Tooltips: Record<string, string> = {
        Gangbaar: "Conventionele melkveehouderij, niet gecertificeerd biologisch of natuurinclusief.",
        Natuurinclusief: "Boeren met meer ruimte voor natuur op en rond het bedrijf (bijv. weidevogels, kruidenrijk grasland), zonder per se biologisch te zijn.",
        Biologisch: "Gecertificeerd biologisch: o.a. biologisch voer, weidegang, beperkt gebruik van middelen.",
        "In omschakeling": "Je bent bezig met de overstap naar bijvoorbeeld biologisch of natuurinclusief.",
      };
      return (
        <>
          <RadioGroup value={fd.q1 ?? ""} onValueChange={(v) => update({ q1: v })} className="space-y-2">
            {Q1_OPTIONS.filter((o) => o.id !== "Anders").map((opt) => (
              <div key={opt.id} className={OPTION_ROW_CLASS}>
                <RadioGroupItem value={opt.id} id={`q1-${opt.id}`} />
                <Label htmlFor={`q1-${opt.id}`} className="flex-1 cursor-pointer text-sm font-medium">
                  {q1Tooltips[opt.label] ? (
                    <TermWithTooltip term={opt.label} explanation={q1Tooltips[opt.label]} />
                  ) : (
                    opt.label
                  )}
                </Label>
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
                value={fd.q1_anders ?? ""}
                onChange={(e) => update({ q1_anders: e.target.value })}
                placeholder="Anders, namelijk"
                maxLength={200}
              />
            </div>
          )}
        </>
      );
    },
  });

  screens.push({
    id: "q2",
    group: "Deel 1 – Je bedrijf",
    questionNumber: 2,
    title: "Hoe groot is je bedrijf?",
    subtitle: "Geef aantallen in gehele getallen. Melkkoeien = dieren die melk geven; hectares = totaal landbouwgrond van je bedrijf.",
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
    group: "Deel 1 – Je bedrijf",
    questionNumber: 3,
    title: "In welke fase bevindt je bedrijf zich?",
    subtitle: "Waar staat je bedrijf de komende jaren: groei, stabilisatie, overdracht of nog onzeker?",
    choiceField: "q3",
    render: (fd, update) => (
      <RadioGroup value={fd.q3 ?? ""} onValueChange={(v) => update({ q3: v })} className="space-y-2">
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
    title: "Welke ontwikkelingen hebben de meeste invloed op je bedrijfsvoering?",
    subtitle: "Denk aan wat op jouw melkveebedrijf het zwaarst weegt. Kies maximaal 3.",
    multiChoiceField: "q4",
    maxChoices: 3,
    render: (fd, update, toggleMulti) => {
      const onToggle = (v: string) => toggleMulti("q4", v, 3);
      const selected = Array.isArray(fd.q4) ? fd.q4 : [];
      return (
        <div className="space-y-3">
          <p className={HELPER_TEXT_CLASS}>{selected.length}/3 gekozen</p>
          <div className="flex flex-wrap gap-2">
            {Q4_OPTIONS.map((opt) => {
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
          {selected.includes("Anders, namelijk:") && (
            <div className="mt-3">
              <Label className={QUESTION_LABEL_CLASS}>Anders, namelijk:</Label>
              <Input
                value={fd.q4_anders ?? ""}
                onChange={(e) => update({ q4_anders: e.target.value })}
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
    id: "q4a",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 4,
    title: "Welke regelgeving speelt vooral?",
    subtitle: "Je hebt bij de vorige vraag 'Regelgeving' gekozen. Welke regels hebben op jouw melkveebedrijf de meeste impact? Meerdere antwoorden mogelijk.",
    multiChoiceField: "q4a",
    maxChoices: undefined,
    render: (fd, update, toggleMulti) => {
      const selected = Array.isArray(fd.q4a) ? fd.q4a : [];
      // Alleen tonen als bij q4 "Regelgeving" is gekozen
      const q4 = Array.isArray(fd.q4) ? fd.q4 : [];
      const show = q4.includes("Regelgeving");
      if (!show) {
        if (selected.length || fd.q4a_anders) {
          update({ q4a: [], q4a_anders: "" });
        }
        return null;
      }
      const q4aTooltips: Record<string, string> = {
        "Natura2000 / ligging nabij natuurgebied": "Europese natuurgebieden; ligging in of nabij zo’n gebied heeft gevolgen voor vergunningen en stikstof.",
        "Afbouw derogatie / nitraateisen": "Derogatie = uitzondering op de norm voor stikstof in mest; afbouw betekent strengere nitraateisen voor grasland.",
        "Waterkwaliteitseisen (KRW)": "Kaderrichtlijn Water: eisen aan de kwaliteit van sloten en oppervlaktewater op en rond je bedrijf.",
        "Dierwelzijns- en stalregelgeving": "Regels over huisvesting, weidegang en welzijn van melkvee.",
      };
      return (
        <div className="space-y-3">
          <p className={HELPER_TEXT_CLASS}>Meerdere antwoorden mogelijk.</p>
          <div className="flex flex-wrap gap-2">
            {Q4A_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleMulti("q4a", opt)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm ${
                  selected.includes(opt) ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                {opt}
                {q4aTooltips[opt] && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 cursor-help" tabIndex={0} onClick={(e) => e.stopPropagation()}>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[260px]">
                      <p className="text-left">{q4aTooltips[opt]}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </button>
            ))}
          </div>
          {selected.includes("Anders, namelijk:") && (
            <div className="mt-3">
              <Label className={QUESTION_LABEL_CLASS}>Anders, namelijk:</Label>
              <Input
                value={fd.q4a_anders ?? ""}
                onChange={(e) => update({ q4a_anders: e.target.value })}
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
    id: "q5",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 5,
    title: "In hoeverre is verduurzaming volgens jou van belang voor de continuïteit van je bedrijf?",
    subtitle: "Verduurzaming: bijvoorbeeld minder uitstoot, meer biodiversiteit, kringlooplandbouw of aanpassing aan klimaat.",
    render: (fd, update) => (
      <ScaleSlider
        value={fd.q5a ?? 4}
        onValueChange={(v) => update({ q5a: v })}
        labelLeft="Nauwelijks van belang"
        labelRight="Zeer belangrijk"
      />
    ),
  });

  screens.push({
    id: "q5b",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 5,
    title: "In hoeverre verwacht je dat CO₂-reductie invloed zal hebben op je bedrijf in de komende 10 jaar?",
    subtitle: "CO₂-reductie: eisen vanuit klimaatbeleid of keten (bijv. methaan, broeikasgassen) voor jouw melkveebedrijf.",
    render: (fd, update) => (
      <ScaleSlider
        value={fd.q5b ?? 4}
        onValueChange={(v) => update({ q5b: v })}
        labelLeft="Nauwelijks invloed"
        labelRight="Grote invloed"
      />
    ),
  });

  screens.push({
    id: "q5c",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 5,
    title: "In hoeverre zie je biodiversiteit als relevant voor je bedrijfsvoering?",
    subtitle: "Biodiversiteit: variatie in planten en dieren op en rond je bedrijf (weidevogels, kruidenrijk grasland, sloten, etc.).",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <div className="space-y-4">
        <ScaleSlider
          value={fd.q5c ?? 4}
          onValueChange={(v) => update({ q5c: v })}
          labelLeft="Nauwelijks relevant"
          labelRight="Zeer relevant"
        />
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <Label className="mb-2 block text-sm font-medium text-foreground">Optioneel: toelichting</Label>
          <PiiTextarea
            value={fd.q5_toelichting ?? ""}
            onChange={(v) => update({ q5_toelichting: v })}
            onPiiChange={setPiiBlocked}
            placeholder="Licht je antwoord toe indien gewenst"
            rows={3}
            maxLength={800}
          />
        </div>
      </div>
    ),
  });

  screens.push({
    id: "q6",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 6,
    title: "Wat zijn op dit moment de grootste zorgen voor je bedrijf voor de komende 5–10 jaar?",
    subtitle: "Denk aan jouw melkveebedrijf: wat houdt jou als ondernemer het meest bezig? Bijv. regelgeving, rendement, opvolging of klimaat.",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <PiiTextarea
        value={fd.q6 ?? ""}
        onChange={(v) => update({ q6: v })}
        onPiiChange={setPiiBlocked}
        placeholder="Bijvoorbeeld: regelgeving, rendement, opvolging, klimaat..."
        rows={4}
        maxLength={1000}
      />
    ),
  });

  screens.push({
    id: "q7",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 7,
    title: "Gelet op alle regelgeving: in hoeverre heb je het gevoel zelf invloed te hebben op de toekomst van je bedrijf?",
    subtitle: "Denk aan vergunningen, stikstof, mest, klimaat en andere regels die op jouw bedrijf van toepassing zijn.",
    render: (fd, update) => (
      <ScaleSlider
        value={fd.q7 ?? 4}
        onValueChange={(v) => update({ q7: v })}
        labelLeft="Nauwelijks invloed"
        labelRight="Veel invloed"
      />
    ),
  });

  // Deel 3 – Veranderingen in bedrijfsvoering
  screens.push({
    id: "q8",
    group: "Deel 3 – Veranderingen in bedrijfsvoering",
    questionNumber: 8,
    title: "Heb je de afgelopen 5 jaar aanpassingen gedaan in je bedrijfsvoering?",
    subtitle: "Bijvoorbeeld aanpassingen in stalbouw, voer, weidegang, grondgebruik of mest op je melkveebedrijf.",
    choiceField: "q8",
    hasPiiField: true,
    render: (fd, update, _toggleMulti, setPiiBlocked) => (
      <div className="space-y-6">
        <RadioGroup value={fd.q8 ?? ""} onValueChange={(v) => update({ q8: v })} className="space-y-2">
          {Q8_OPTIONS.map((opt) => (
            <div key={opt.id} className={OPTION_ROW_CLASS}>
              <RadioGroupItem value={opt.id} id={`q8-${opt.id}`} />
              <Label htmlFor={`q8-${opt.id}`} className="flex-1 cursor-pointer text-sm font-medium">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {(fd.q8 === "Ja, meerdere" || fd.q8 === "Ja, beperkt") && (
          <>
            <div>
              <Label className={QUESTION_LABEL_CLASS}>Kun je kort aangeven welke aanpassingen dit waren? (bijv. stalbouw, voer, grondgebruik)</Label>
              <PiiTextarea
                value={fd.q8a ?? ""}
                onChange={(v) => update({ q8a: v })}
                onPiiChange={setPiiBlocked}
                placeholder="Maximaal 2–3 regels"
                rows={3}
                maxLength={500}
              />
            </div>
          </>
        )}
      </div>
    ),
  });

  screens.push({
    id: "q9",
    group: "Deel 3 – Veranderingen in bedrijfsvoering",
    questionNumber: 9,
    title: "Wat waren de belangrijkste oorzaken van de aanpassingen in je bedrijfsvoering?",
    subtitle: "Sluit aan op je eerdere antwoord. Kies maximaal 2 aanleidingen.",
    multiChoiceField: "q9",
    maxChoices: 2,
    hasPiiField: true,
    render: (fd, update, toggleMulti, setPiiBlocked) => {
      const show = fd.q8 === "Ja, meerdere" || fd.q8 === "Ja, beperkt";
      const selected = Array.isArray(fd.q9) ? fd.q9 : [];
      if (!show) {
        if (selected.length || fd.q9_anders || fd.q9_regelgeving) {
          update({ q9: [], q9_anders: "", q9_regelgeving: "" });
        }
        return (
          <p className={HELPER_TEXT_CLASS}>
            Deze vraag is niet van toepassing omdat je geen aanpassingen in de afgelopen 5 jaar hebt aangegeven.
          </p>
        );
      }
      return (
        <div className="space-y-4">
          <div>
            <p className={HELPER_TEXT_CLASS}>Kies maximaal 2.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Q9_OPTIONS.map((opt) => {
                const isSelected = selected.includes(opt);
                const disabled = !isSelected && selected.length >= 2;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => !disabled && toggleMulti("q9", opt, 2)}
                    disabled={disabled}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      isSelected ? "border-primary bg-primary/10" : "border-border"
                    } ${disabled ? "opacity-50" : ""}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {selected.includes("Nieuwe regelgeving") && (
            <div>
              <Label className={QUESTION_LABEL_CLASS}>Welke regelgeving?</Label>
              <PiiTextarea
                value={fd.q9_regelgeving ?? ""}
                onChange={(v) => update({ q9_regelgeving: v })}
                onPiiChange={setPiiBlocked}
                placeholder="Bijvoorbeeld: wijziging in mestbeleid, fosfaatrechten, etc."
                rows={3}
                maxLength={500}
              />
            </div>
          )}

          {selected.includes("Anders, namelijk:") && (
            <div>
              <Label className={QUESTION_LABEL_CLASS}>Anders, namelijk:</Label>
              <Input
                value={fd.q9_anders ?? ""}
                onChange={(e) => update({ q9_anders: e.target.value })}
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
    id: "q10",
    group: "Deel 3 – Veranderingen in bedrijfsvoering",
    questionNumber: 10,
    title: "Wat zou voor jou een duidelijke aanleiding zijn om (opnieuw) aanpassingen te doen?",
    subtitle: "Bijvoorbeeld: zekerheid over vergoedingen, duidelijkheid in regelgeving, beschikbare kennis of begeleiding, financiële ondersteuning.",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <PiiTextarea
        value={fd.q10 ?? ""}
        onChange={(v) => update({ q10: v })}
        onPiiChange={setPiiBlocked}
        placeholder="Beschrijf wat je zou helpen om de stap te zetten..."
        rows={4}
        maxLength={1000}
      />
    ),
  });

  // Deel 3 – Veranderingen (vervolg): barrières
  screens.push({
    id: "q11",
    group: "Deel 3 – Veranderingen in bedrijfsvoering",
    questionNumber: 11,
    title: "Wat houdt je tegen om aanpassingen in je bedrijfsvoering te doen?",
    subtitle: "Sluit aan op de vorige vragen. Denk aan wat je tegenhoudt om te verduurzamen of te investeren. Kies maximaal 2.",
    multiChoiceField: "q11",
    maxChoices: 2,
    hasPiiField: true,
    render: (fd, update, toggleMulti, setPiiBlocked) => {
      const selected = Array.isArray(fd.q11) ? fd.q11 : [];
      return (
        <div className="space-y-4">
          <div>
            <p className={HELPER_TEXT_CLASS}>{selected.length}/2 gekozen</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Q11_OPTIONS.map((opt) => {
                const isSelected = selected.includes(opt);
                const disabled = !isSelected && selected.length >= 2;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => !disabled && toggleMulti("q11", opt, 2)}
                    disabled={disabled}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      isSelected ? "border-primary bg-primary/10" : "border-border"
                    } ${disabled ? "opacity-50" : ""}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
          {selected.includes("Anders, namelijk:") && (
            <div>
              <Label className={QUESTION_LABEL_CLASS}>Anders, namelijk:</Label>
              <Input
                value={fd.q11_anders ?? ""}
                onChange={(e) => update({ q11_anders: e.target.value })}
                placeholder="Toelichting"
                maxLength={200}
              />
            </div>
          )}
          <div>
            <Label className={QUESTION_LABEL_CLASS}>Optioneel: Kun je dit kort toelichten?</Label>
            <PiiTextarea
              value={fd.q11_toelichting ?? ""}
              onChange={(v) => update({ q11_toelichting: v })}
              onPiiChange={setPiiBlocked}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
      );
    },
  });

  // Deel 4 – Welke ondersteuning zou helpen?
  const Q12_SLIDER_OPTIONS: { key: keyof UniveFormData; label: string }[] = [
    { key: "q12_financieel", label: "Financiële ondersteuning" },
    { key: "q12_pacht", label: "Pacht" },
    { key: "q12_co2", label: "Vergoeding CO₂-opvang" },
    { key: "q12_premiekorting", label: "Premiekorting" },
    { key: "q12_klimaatadaptie", label: "Klimaatadaptie" },
    { key: "q12_biodiversiteit", label: "Biodiversiteit" },
  ];
  screens.push({
    id: "q12",
    group: "Deel 4 – Welke ondersteuning zou helpen?",
    questionNumber: 12,
    title: "In hoeverre sta je open voor ondersteuning van Univé per type?",
    subtitle: "Geef per onderwerp aan hoe open je ervoor staat (1 = niet open, 7 = zeer open). Het gaat om ondersteuning voor jouw melkveebedrijf.",
    render: (fd, update) => (
      <div className="space-y-5">
        {Q12_SLIDER_OPTIONS.map(({ key, label }) => (
          <SliderRow
            key={key}
            label={label}
            value={(fd[key] as number) ?? 4}
            onValueChange={(v) => update({ [key]: v } as Partial<UniveFormData>)}
          />
        ))}
      </div>
    ),
  });

  const Q13_SLIDER_OPTIONS: { key: keyof UniveFormData; label: string }[] = [
    { key: "q13_financieel", label: "Financiële ondersteuning" },
    { key: "q13_pacht", label: "Pacht" },
    { key: "q13_co2", label: "Vergoeding CO₂-opvang" },
    { key: "q13_premiekorting", label: "Premiekorting" },
    { key: "q13_klimaatadaptie", label: "Klimaatadaptie" },
    { key: "q13_biodiversiteit", label: "Biodiversiteit" },
  ];
  screens.push({
    id: "q13",
    group: "Deel 4 – Welke ondersteuning zou helpen?",
    questionNumber: 13,
    title: "Welke vormen van ondersteuning zijn voor jou het meest waardevol?",
    subtitle: "Geef per type aan hoe waardevol (1 = weinig, 7 = zeer waardevol).",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <div className="space-y-5">
        {Q13_SLIDER_OPTIONS.map(({ key, label }) => (
          <SliderRow
            key={key}
            label={label}
            value={(fd[key] as number) ?? 4}
            onValueChange={(v) => update({ [key]: v } as Partial<UniveFormData>)}
          />
        ))}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <Label className="mb-2 block text-sm font-medium text-foreground">Optioneel: aanvulling</Label>
          <PiiTextarea
            value={fd.q13 ?? ""}
            onChange={(v) => update({ q13: v })}
            onPiiChange={setPiiBlocked}
            placeholder="Bijvoorbeeld: investeringssteun, langjarige afspraken, begeleiding op het erf..."
            rows={2}
            maxLength={800}
          />
        </div>
      </div>
    ),
  });

  screens.push({
    id: "q14",
    group: "Deel 4 – Welke ondersteuning zou helpen?",
    questionNumber: 14,
    title: "Zou je andere modellen of verduurzamingsopties overwegen?",
    subtitle: "Denk aan mogelijkheden naast of binnen je huidige melkveehouderij. Meerdere antwoorden mogelijk. Geen verplichting.",
    multiChoiceField: "q14",
    render: (fd, update, toggleMulti) => {
      const q14 = Array.isArray(fd.q14) ? fd.q14 : [];
      const q14Tooltips: Record<string, string> = {
        "Landschapselementen als houtwallen": "Bijv. houtwallen, singels, poelen: natuur op je perceel die ook waarde heeft voor biodiversiteit.",
        "Agroforestry": "Combinatie van landbouw en bomen of struiken op hetzelfde perceel (bijv. bomen in de wei of langs percelen).",
        "Teelten als hennep": "Andere gewassen naast gras, zoals hennep of andere nicheteelten, voor vezel of andere afzet.",
        "Productief kruidenrijk grasland": "Grasland met meer kruiden en bloemen, goed voor weidevogels en insecten, met behoud van opbrengst.",
        "Biobased bouwen": "Gebruik van natuurlijke materialen (bijv. hennep, hout) voor bouw of verbouw op je erf.",
      };
      return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {Q14_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleMulti("q14", opt)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm ${
                q14.includes(opt) ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              {opt}
              {q14Tooltips[opt] && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex shrink-0 cursor-help" tabIndex={0} onClick={(e) => e.stopPropagation()}>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[280px]">
                    <p className="text-left">{q14Tooltips[opt]}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </button>
          ))}
        </div>
        {q14.includes("Anders, namelijk:") && (
          <div className="mt-3">
            <Input
              value={fd.q14_anders ?? ""}
              onChange={(e) => update({ q14_anders: e.target.value })}
              placeholder="Anders, namelijk"
              maxLength={200}
            />
          </div>
        )}
      </div>
    );
    },
  });

  // Deel 5 – Verdienmodel en kwetsbaarheden
  const Q15A_SLIDER_OPTIONS: { key: keyof UniveFormData; label: string }[] = [
    { key: "q15a_nevenactiviteiten", label: "Aanvullende inkomsten uit nevenactiviteiten" },
    { key: "q15a_pacht", label: "Pacht of verhuur van grond" },
    { key: "q15a_risicospreiding", label: "Risicospreiding (bijv. via verzekering)" },
    { key: "q15a_verbreding", label: "Verbreding (meerdere inkomensbronnen)" },
  ];
  screens.push({
    id: "q15a",
    group: "Deel 5 – Verdienmodel en kwetsbaarheden",
    questionNumber: 15,
    title: "In hoeverre heb je behoefte aan aanvullende inkomsten of risicospreiding?",
    subtitle: "Denk aan inkomsten of zekerheid naast de melkproductie. Geef per optie aan (1 = geen behoefte, 7 = sterke behoefte).",
    render: (fd, update) => (
      <div className="space-y-5">
        {Q15A_SLIDER_OPTIONS.map(({ key, label }) => (
          <SliderRow
            key={key}
            label={label}
            value={(fd[key] as number) ?? 4}
            onValueChange={(v) => update({ [key]: v } as Partial<UniveFormData>)}
          />
        ))}
      </div>
    ),
  });

  screens.push({
    id: "q15b",
    group: "Deel 5 – Verdienmodel en kwetsbaarheden",
    questionNumber: 16,
    subtitle: "Denk aan nevenactiviteiten, pacht, verzekering, andere teelten of inkomensbronnen naast de melkveehouderij.",
    title: "Zie je mogelijkheden om je inkomsten te verbreden of risico’s te spreiden?",
    hasPiiField: true,
    choiceField: "q15b",
    render: (fd, update, _, setPiiBlocked) => (
      <div className="space-y-4">
        <RadioGroup value={fd.q15b ?? ""} onValueChange={(v) => update({ q15b: v })} className="space-y-2">
          {Q15B_OPTIONS.map((opt) => (
            <div key={opt.id} className={OPTION_ROW_CLASS}>
              <RadioGroupItem value={opt.id} id={`q15b-${opt.id}`} />
              <Label htmlFor={`q15b-${opt.id}`} className="flex-1 cursor-pointer text-sm font-medium">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <Label className="mb-2 block text-sm font-medium text-foreground">Optioneel: toelichting</Label>
          <PiiTextarea
            value={fd.q15b_toelichting ?? ""}
            onChange={(v) => update({ q15b_toelichting: v })}
            onPiiChange={setPiiBlocked}
            placeholder="Welke mogelijkheden zie je, of waarom weinig?"
            rows={3}
            maxLength={600}
          />
        </div>
      </div>
    ),
  });

  const Q16_SLIDER_OPTIONS: { key: keyof UniveFormData; label: string }[] = [
    { key: "q16_marge", label: "Voldoende marge per jaar" },
    { key: "q16_schuldenlast", label: "Lage schuldenlast" },
    { key: "q16_continuïteit", label: "Continuïteit voor volgende generatie" },
    { key: "q16_stabiliteit", label: "Stabiliteit / weinig schommelingen" },
    { key: "q16_voortzetten", label: "Bedrijf in huidige vorm kunnen voortzetten" },
    { key: "q16_waardebehoud", label: "Waardebehoud van grond en bedrijf" },
  ];
  screens.push({
    id: "q16",
    group: "Deel 5 – Verdienmodel en kwetsbaarheden",
    questionNumber: 16,
    title: "Wat betekent rendabel ondernemen voor jou?",
    subtitle: "Geef per aspect aan hoe belangrijk dit voor jouw bedrijf is (1 = weinig, 7 = zeer belangrijk).",
    render: (fd, update) => (
      <div className="space-y-5">
        {Q16_SLIDER_OPTIONS.map(({ key, label }) => (
          <SliderRow
            key={key}
            label={label}
            value={(fd[key] as number) ?? 4}
            onValueChange={(v) => update({ [key]: v } as Partial<UniveFormData>)}
          />
        ))}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <Label className="mb-2 block text-sm font-medium text-foreground">Anders, namelijk:</Label>
          <Input
            value={fd.q16_anders ?? ""}
            onChange={(e) => update({ q16_anders: e.target.value })}
            placeholder="Kort toelichten indien gewenst"
            maxLength={200}
          />
        </div>
      </div>
    ),
  });

  // Deel 6 – Afsluiting
  screens.push({
    id: "q17",
    group: "Deel 6 – Afsluiting",
    questionNumber: 17,
    title: "Wat zou je idealiter het liefst aanpassen aan je huidige bedrijfsvoering?",
    subtitle: "Denk aan je melkveebedrijf: wat zou je het eerste willen veranderen als het kon?",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <PiiTextarea
        value={fd.q17 ?? ""}
        onChange={(v) => update({ q17: v })}
        onPiiChange={setPiiBlocked}
        placeholder="Beschrijf kort wat je het liefst zou veranderen."
        rows={4}
        maxLength={800}
      />
    ),
  });

  screens.push({
    id: "q18",
    group: "Deel 6 – Afsluiting",
    questionNumber: 18,
    title: "Wat moeten partijen zoals verzekeraars beter begrijpen van de praktijk op je erf?",
    subtitle: "Wat zouden zij beter moeten zien, horen of begrijpen over het runnen van een melkveebedrijf?",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <PiiTextarea
        value={fd.q18 ?? ""}
        onChange={(v) => update({ q18: v })}
        onPiiChange={setPiiBlocked}
        placeholder="Wat zouden partijen beter moeten zien, horen of begrijpen?"
        rows={4}
        maxLength={800}
      />
    ),
  });

  screens.push({
    id: "q19",
    group: "Deel 6 – Afsluiting",
    questionNumber: 19,
    title: "Sta je ervoor open dat er contact met je wordt opgenomen?",
    subtitle: "Optioneel. Als je 'Ja' kiest, kunnen we je gegevens gebruiken om later contact op te nemen over deze vragenlijst of ondersteuning.",
    hasPiiField: true,
    render: (fd, update, _toggleMulti, setPiiBlocked) => {
      const toestemming = fd.q19_toestemming_contact ?? "";
      return (
        <div className="space-y-5">
          <RadioGroup
            value={toestemming}
            onValueChange={(v) => update({ q19_toestemming_contact: v })}
            className="space-y-2"
          >
            <div className={OPTION_ROW_CLASS}>
              <RadioGroupItem value="Ja" id="q19-ja" />
              <Label htmlFor="q19-ja" className="flex-1 cursor-pointer text-sm font-medium">
                Ja, er mag contact met mij worden opgenomen
              </Label>
            </div>
            <div className={OPTION_ROW_CLASS}>
              <RadioGroupItem value="Nee" id="q19-nee" />
              <Label htmlFor="q19-nee" className="flex-1 cursor-pointer text-sm font-medium">
                Nee, liever niet
              </Label>
            </div>
          </RadioGroup>

          {toestemming === "Ja" && (
            <div className="space-y-4">
              <div>
                <Label className={QUESTION_LABEL_CLASS}>Naam</Label>
                <Input
                  value={fd.q19_naam ?? ""}
                  onChange={(e) => update({ q19_naam: e.target.value })}
                  placeholder="Je naam"
                  maxLength={200}
                />
              </div>
              <div>
                <Label className={QUESTION_LABEL_CLASS}>E-mailadres</Label>
                <Input
                  type="email"
                  value={fd.q19_email ?? ""}
                  onChange={(e) => update({ q19_email: e.target.value })}
                  placeholder="bijvoorbeeld: boer@voorbeeld.nl"
                  maxLength={200}
                />
                <p className={HELPER_TEXT_CLASS}>Let op: vul een geldig e-mailadres in.</p>
              </div>
              <div>
                <Label className={QUESTION_LABEL_CLASS}>Telefoonnummer</Label>
                <Input
                  value={fd.q19_telefoon ?? ""}
                  onChange={(e) => update({ q19_telefoon: e.target.value })}
                  placeholder="bijvoorbeeld: 06-12345678"
                  maxLength={50}
                />
              </div>
            </div>
          )}

          <div>
            <Label className={QUESTION_LABEL_CLASS}>Aanvullende opmerkingen (optioneel)</Label>
            <PiiTextarea
              value={fd.q19_opmerkingen ?? ""}
              onChange={(v) => update({ q19_opmerkingen: v })}
              onPiiChange={setPiiBlocked}
              rows={3}
              maxLength={600}
            />
          </div>
        </div>
      );
    },
  });

  return screens;
}

export function isUniveStepValid(screen: UniveScreen, fd: UniveFormData, piiBlocked: boolean): boolean {
  if (piiBlocked && screen.hasPiiField) return false;
  if (screen.required === false) return true;
  if (screen.id === "q2") {
    const cows = Number(fd.q2_cows);
    const hectares = Number(fd.q2_hectares);
    return (Number.isFinite(cows) && cows > 0) || (Number.isFinite(hectares) && hectares > 0);
  }
  if (screen.id === "q8") {
    const q8 = typeof fd.q8 === "string" ? fd.q8.trim() : "";
    if (!q8) return false;
    return true;
  }
  if (screen.id === "q9") {
    const q8 = typeof fd.q8 === "string" ? fd.q8.trim() : "";
    const show = q8 === "Ja, meerdere" || q8 === "Ja, beperkt";
    if (!show) return true;
    const q9 = Array.isArray(fd.q9) ? fd.q9 : [];
    if (q9.length === 0) return false;
    return true;
  }
  if (screen.id === "q19") {
    const toestemming = typeof fd.q19_toestemming_contact === "string" ? fd.q19_toestemming_contact.trim() : "";
    if (!toestemming) return false;
    if (toestemming === "Ja") {
      const email = typeof fd.q19_email === "string" ? fd.q19_email : "";
      if (!email || !email.includes("@")) return false;
    }
    return true;
  }
  if (screen.choiceField) {
    const val = fd[screen.choiceField];
    const str = typeof val === "string" ? val.trim() : "";
    if (!str) return false;
  }
  if (screen.multiChoiceField && screen.maxChoices !== undefined) {
    const arr = fd[screen.multiChoiceField];
    if (!Array.isArray(arr)) return true; // optional
  }
  return true;
}

/** Of dit scherm alleen getoond wordt onder een voorwaarde (q4a, q9). */
export function isStepConditionallyHidden(screenId: string, fd: UniveFormData): boolean {
  if (screenId === "q4a") {
    const q4 = Array.isArray(fd.q4) ? fd.q4 : [];
    return !q4.includes("Regelgeving");
  }
  if (screenId === "q9") {
    const q8 = typeof fd.q8 === "string" ? fd.q8.trim() : "";
    return q8 !== "Ja, meerdere" && q8 !== "Ja, beperkt";
  }
  return false;
}
