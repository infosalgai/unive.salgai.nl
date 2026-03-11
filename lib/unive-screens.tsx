"use client";

import React, { useRef, useState, useLayoutEffect } from "react";
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

/** Cijfers 1–7 onder een 1–7-slider, precies onder het balletje (thumb).
 * We gebruiken de exacte breedte én de horizontale positie van de track binnen de wrapper
 * zodat de cijfers 1–7 echt onder de Radix-thumb staan.
 */
function SliderScaleLabels({
  trackWidth,
  trackOffsetLeft,
}: {
  trackWidth?: number | null;
  trackOffsetLeft?: number | null;
}) {
  const positions = [1, 2, 3, 4, 5, 6, 7];
  return (
    <div
      className="relative h-4 text-xs text-muted-foreground"
      style={
        trackWidth != null && trackOffsetLeft != null
          ? { width: trackWidth, marginLeft: trackOffsetLeft }
          : { width: "100%" }
      }
    >
      {positions.map((n) => (
        <span
          key={n}
          className="absolute tabular-nums -translate-x-1/2"
          style={{
            left:
              trackWidth != null
                ? `${((n - 1) / 6) * trackWidth}px`
                : `${((n - 1) / 6) * 100}%`,
          }}
          aria-hidden
        >
          {n}
        </span>
      ))}
    </div>
  );
}

/** Meet de exacte breedte én positie van de slider-track en rendert de schaalcijfers daar direct onder. */
function SliderWithScaleLabels({ children }: { children: React.ReactNode }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState<number | null>(null);
  const [trackOffsetLeft, setTrackOffsetLeft] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const measure = () => {
      const track = el.querySelector<HTMLElement>('[data-slot="slider-track"]');
      if (!track) return;
      const trackRect = track.getBoundingClientRect();
      const wrapperRect = el.getBoundingClientRect();
      setTrackWidth(trackRect.width);
      setTrackOffsetLeft(trackRect.left - wrapperRect.left);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <>
      <div ref={sliderRef} className="w-full">
        {children}
      </div>
      <SliderScaleLabels trackWidth={trackWidth} trackOffsetLeft={trackOffsetLeft} />
    </>
  );
}

/** Likert-schaal 1–7: balk met schuifje van links (1) naar rechts (7), daaronder labels en cijfers */
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
    <div className="space-y-3" role="group" aria-label="Schaal 1 tot 7">
      {/* Eerst labels links/rechts boven de balk voor duidelijke Likert-weergave */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span className="whitespace-nowrap">{labelLeft}</span>
        <span className="whitespace-nowrap">{labelRight}</span>
      </div>
      {/* Balk met schuifje; cijfers 1–7 exact onder het balletje */}
      <SliderWithScaleLabels>
        <div className="w-full [&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:shadow-md [&_[data-slot=slider-thumb]]:cursor-grab [&_[data-slot=slider-thumb]]:active:cursor-grabbing">
          <Slider
            value={[value]}
            onValueChange={([v]) => onValueChange(v)}
            min={1}
            max={7}
            step={1}
            className="w-full"
            aria-label="Kies een waarde van 1 tot 7"
          />
        </div>
      </SliderWithScaleLabels>
    </div>
  );
}

/** Eén rij: label, dan Likert-balk 1–7 met schuifje, daaronder cijfers (voor meerdere sliders op één scherm) */
function SliderRow({
  label,
  value,
  onValueChange,
  tooltip,
}: {
  label: string;
  value: number;
  onValueChange: (v: number) => void;
  tooltip?: string;
}) {
  return (
    <div className="space-y-2" role="group">
      <Label className="text-sm font-medium text-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span>{label}</span>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex shrink-0 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Uitleg: ${label}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className="h-3.5 w-3.5" aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px]">
                <p className="text-left">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </span>
      </Label>
      <div className="space-y-2">
        <SliderWithScaleLabels>
          <div className="w-full [&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:shadow-md [&_[data-slot=slider-thumb]]:cursor-grab [&_[data-slot=slider-thumb]]:active:cursor-grabbing">
            <Slider
              value={[value]}
              onValueChange={([v]) => onValueChange(v)}
              min={1}
              max={7}
              step={1}
              className="w-full"
              aria-label={`${label}, waarde ${value} van 7`}
            />
          </div>
        </SliderWithScaleLabels>
      </div>
    </div>
  );
}

// ── Opties (exacte Nederlandse formulering conform nieuwe vragenlijst) ──
const Q0_GESLACHT_OPTIONS = [
  { id: "Man", label: "Man" },
  { id: "Vrouw", label: "Vrouw" },
  { id: "Anders", label: "Anders / wil ik liever niet zeggen" },
];

const Q0_LEEFTIJD_OPTIONS = [
  { id: "Jonger dan 30", label: "Jonger dan 30" },
  { id: "30-39", label: "30-39" },
  { id: "40-49", label: "40-49" },
  { id: "50-59", label: "50-59" },
  { id: "60 jaar of ouder", label: "60 jaar of ouder" },
];

const Q1_OPTIONS = [
  { id: "Gangbaar", label: "Gangbaar" },
  { id: "Natuurinclusief", label: "Natuurinclusief" },
  { id: "Biologisch", label: "Biologisch" },
  { id: "In omschakeling", label: "In omschakeling" },
  { id: "Anders", label: "Anders, namelijk:" },
];

const Q1_OMSCHAKELING_OPTIONS = [
  "Biologisch",
  "Natuurinclusief",
  "Extensivering van het bedrijf",
  "Anders, namelijk:",
];

const Q3_OPTIONS = [
  { id: "Groei / uitbreiding", label: "Groei / uitbreiding" },
  { id: "Stabilisatie", label: "Stabilisatie" },
  { id: "Afschalen / krimp", label: "Afschalen / krimp" },
  { id: "Overdracht binnen 10 jaar", label: "Overdracht binnen 10 jaar" },
  { id: "Onzeker / nog geen duidelijke richting", label: "Onzeker / nog geen duidelijke richting" },
];

const Q4_OPTIONS = [
  "Regelgeving",
  "Melkprijs",
  "Kosten (voer, energie, mest)",
  "Financiering / bank",
  "Subsidies / vergoedingen",
  "Klimaatverandering / extreme weersomstandigheden",
  "Biodiversiteit / natuurbeheer",
  "Maatschappelijke druk",
  "Opvolging",
  "Werkplezier",
  "Anders, namelijk:",
];

const Q4A_OPTIONS = [
  "Stikstof- en vergunningenproblematiek",
  "Natura 2000 / ligging nabij natuurgebied",
  "Mestbeleid en mestplaatsingsruimte",
  "Fosfaatrechten",
  "Afbouw derogatie / nitraateisen",
  "Klimaat- en broeikasgasbeleid",
  "Dierwelzijns- en stalregelgeving",
  "Waterkwaliteitseisen (KRW)",
  "Gebiedsgerichte aanpak / uitkoopregelingen",
  "Anders, namelijk:",
];

const Q4A_TOOLTIPS: Record<string, string> = {
  "Stikstof- en vergunningenproblematiek":
    "Beperkingen of onzekerheid rondom stikstofregels en vergunningverlening voor je bedrijf.",
  "Natura 2000 / ligging nabij natuurgebied":
    "Invloed van de ligging van jouw bedrijf nabij Natura 2000-gebieden of andere beschermde natuur.",
  "Mestbeleid en mestplaatsingsruimte":
    "Regels over mestgebruik, mestafzet en de hoeveelheid mest die op eigen grond geplaatst mag worden.",
  Fosfaatrechten: "Beperkingen of kosten die voortkomen uit het systeem van fosfaatrechten.",
  "Afbouw derogatie / nitraateisen":
    "Gevolgen van het afbouwen van derogatie en strengere nitraatnormen.",
  "Klimaat- en broeikasgasbeleid":
    "Maatregelen of regelgeving gericht op het verminderen van uitstoot van broeikasgassen.",
  "Dierwelzijns- en stalregelgeving":
    "Regels rondom huisvesting van dieren, stalvereisten en dierenwelzijn.",
  "Waterkwaliteitseisen (KRW)":
    "Regels en maatregelen die voortkomen uit de Kaderrichtlijn Water (KRW) voor verbetering van waterkwaliteit.",
  "Gebiedsgerichte aanpak / uitkoopregelingen":
    "Regelingen of plannen in jouw regio gericht op stikstofreductie, extensivering of uitkoop.",
};

const Q8_OPTIONS = [
  { id: "Ja, meerdere", label: "Ja, meerdere grote of verschillende aanpassingen" },
  { id: "Ja, beperkt", label: "Ja, beperkte of enkele aanpassingen" },
  { id: "Nee", label: "Nee, nog geen aanpassingen gedaan" },
  { id: "Weet ik niet", label: "Weet ik niet / moeilijk in te schatten" },
];

/** Vraag 11 – thema’s met Ja/Nee + verplichte toelichting per Ja */
const Q11_THEMES: { key: keyof UniveFormData; keyToelichting: keyof UniveFormData; label: string }[] = [
  {
    key: "q11_duurzaamheid",
    keyToelichting: "q11_duurzaamheid_toelichting",
    label: "Duurzaamheidsmaatregelen (bijv. biodiversiteit, emissiereductie, bodemverbetering, natuurbeheer)",
  },
  {
    key: "q11_bedrijfsschaal",
    keyToelichting: "q11_bedrijfsschaal_toelichting",
    label: "Bedrijfsschaal (bijv. uitbreiding of extensivering van veestapel of grondgebruik)",
  },
  {
    key: "q11_bedrijfsvoering",
    keyToelichting: "q11_bedrijfsvoering_toelichting",
    label: "Bedrijfsvoering (bijv. andere voersystemen, beweiding)",
  },
  {
    key: "q11_verdienmodel",
    keyToelichting: "q11_verdienmodel_toelichting",
    label: "Verdienmodel / verbreding (bijv. verkoop eigen producten, energie, recreatie)",
  },
  {
    key: "q11_investeringen",
    keyToelichting: "q11_investeringen_toelichting",
    label: "Investeringen in gebouwen, stal of techniek",
  },
];

const Q11B_OPTIONS = [
  "Financiële overwegingen",
  "Nieuwe regelgeving",
  "Subsidies / vergoedingen",
  "Persoonlijke overtuiging",
  "Anders, namelijk:",
];

const Q9_OPTIONS = [
  "Financiële noodzaak",
  "Nieuwe regelgeving",
  "Persoonlijke overtuiging",
  "Weet ik niet",
  "Anders, namelijk:",
];

const Q11_OPTIONS = [
  "Onzeker rendement",
  "Investeringsmogelijkheden",
  "Onvoldoende steun van bank",
  "Onzeker beleid",
  "Onvoldoende kennis",
  "Twijfel over praktische haalbaarheid",
  "Anders, namelijk:",
];

/** Vraag 16a en 16b – dezelfde opties (landgebruik/activiteiten) */
const Q16A_OPTIONS = [
  "Houtwallen aanleggen of herstellen (bijv. houtwallen, singels of heggen voor biodiversiteit, beschutting en herstel van landschapselementen)",
  "Bomen combineren met melkvee (agroforestry) (bijv. noten- of fruitbomen combineren met grasland of beweiding)",
  "Nieuwe teelten zoals hennep (bijv. vezelgewassen voor hernieuwbare biobased materialen)",
  "Productief kruidenrijk grasland (grasland met kruiden voor biodiversiteit, bodemkwaliteit en minder kunstmest)",
  "Biobased bouwen (bijv. gebruik van hout, vezelgewassen of andere hernieuwbare natuurlijke materialen bij stallen of schuren)",
  "Anders, namelijk:",
];

function getQ16OptionLabelAndTooltip(option: string): { term: string; tooltip?: string } {
  const match = option.match(/^(.*)\s*\((bijv\.[^)]+)\)$/);
  if (!match) {
    return { term: option };
  }
  const [, term, tooltip] = match;
  return { term: term.trim(), tooltip: tooltip.trim() };
}

const Q14_OPTIONS = [
  "Landschapselementen als houtwallen",
  "Agroforestry",
  "Teelten als hennep",
  "Productief kruidenrijk grasland",
  "Biobased bouwen",
  "Weet ik niet",
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
  /** Optioneel label in de header (bijv. "11b"); anders wordt questionNumber getoond. */
  questionLabel?: string;
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

  // Eerste vraag – geslacht (na introductie)
  screens.push({
    id: "q0_geslacht",
    group: "Algemeen",
    questionNumber: 1,
    title: "Wat is je geslacht?",
    choiceField: "q0_geslacht",
    required: true,
    render: (fd, update) => (
      <RadioGroup value={fd.q0_geslacht ?? ""} onValueChange={(v) => update({ q0_geslacht: v })} className="space-y-2">
        {Q0_GESLACHT_OPTIONS.map((opt) => (
          <div key={opt.id} className={OPTION_ROW_CLASS}>
            <RadioGroupItem value={opt.id} id={`q0_geslacht-${opt.id}`} />
            <Label htmlFor={`q0_geslacht-${opt.id}`} className="flex-1 cursor-pointer text-sm font-medium">
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    ),
  });

  // Tweede vraag – leeftijd
  screens.push({
    id: "q0_leeftijd",
    group: "Algemeen",
    questionNumber: 2,
    title: "Wat is je leeftijd?",
    choiceField: "q0_leeftijd",
    required: true,
    render: (fd, update) => (
      <RadioGroup value={fd.q0_leeftijd ?? ""} onValueChange={(v) => update({ q0_leeftijd: v })} className="space-y-2">
        {Q0_LEEFTIJD_OPTIONS.map((opt) => (
          <div key={opt.id} className={OPTION_ROW_CLASS}>
            <RadioGroupItem value={opt.id} id={`q0_leeftijd-${opt.id}`} />
            <Label htmlFor={`q0_leeftijd-${opt.id}`} className="flex-1 cursor-pointer text-sm font-medium">
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    ),
  });

  // Derde vraag – gemeente
  screens.push({
    id: "q0_gemeente",
    group: "Algemeen",
    questionNumber: 3,
    title: "In welke gemeente ligt jouw melkveebedrijf?",
    required: true,
    render: (fd, update) => (
      <div className="space-y-2">
        <Label htmlFor="q0_gemeente" className={QUESTION_LABEL_CLASS}>
          Gemeente:
        </Label>
        <Input
          id="q0_gemeente"
          type="text"
          value={fd.q0_gemeente ?? ""}
          onChange={(e) => update({ q0_gemeente: e.target.value })}
          placeholder="Bijv. Westerveld"
          maxLength={100}
          className="w-full"
        />
      </div>
    ),
  });

  // Deel 1 – Je bedrijf
  screens.push({
    id: "q1",
    group: "Deel 1 – Je bedrijf",
    questionNumber: 4,
    title: "Wat typeert je bedrijf het beste?",
    subtitle: "Denk aan je manier van boeren: gangbaar, biologisch of natuurinclusief. Kies het type dat het best past.",
    choiceField: "q1",
    render: (fd, update, toggleMulti, setPiiBlocked) => {
      const q1Tooltips: Record<string, string> = {
        Gangbaar: "Conventionele melkveehouderij, niet gecertificeerd biologisch of natuurinclusief.",
        Natuurinclusief: "Boeren met meer ruimte voor natuur op en rond het bedrijf (bijv. weidevogels, kruidenrijk grasland), zonder per se biologisch te zijn.",
        Biologisch: "Gecertificeerd biologisch: o.a. biologisch voer, weidegang, beperkt gebruik van middelen.",
        "In omschakeling": "Je bent bezig met de overstap naar bijvoorbeeld biologisch of natuurinclusief.",
      };
      return (
        <>
          <RadioGroup
            value={fd.q1 ?? ""}
            onValueChange={(v) =>
              update(
                v === "In omschakeling"
                  ? { q1: v }
                  : { q1: v, q1_omschakeling: "", q1_omschakeling_anders: "" }
              )
            }
            className="space-y-2"
          >
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
          {fd.q1 === "In omschakeling" && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Waarnaar ben je in omschakeling?</p>
              <div className="flex flex-wrap gap-2">
                {Q1_OMSCHAKELING_OPTIONS.map((opt) => {
                  const isSelected = (fd.q1_omschakeling ?? "") === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => update({ q1_omschakeling: opt })}
                      className={`rounded-lg border px-4 py-3 text-sm transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {fd.q1_omschakeling === "Anders, namelijk:" && (
                <div className="mt-3">
                  <Label className={QUESTION_LABEL_CLASS}>Anders, namelijk:</Label>
                  <Input
                    value={fd.q1_omschakeling_anders ?? ""}
                    onChange={(e) => update({ q1_omschakeling_anders: e.target.value })}
                    placeholder="Licht kort toe"
                    maxLength={200}
                  />
                </div>
              )}
            </div>
          )}
        </>
      );
    },
  });

  screens.push({
    id: "q2",
    group: "Deel 1 – Je bedrijf",
    questionNumber: 5,
    title: "Hoe groot is jouw bedrijf?",
    subtitle: "Geef aantallen in gehele getallen.",
    render: (fd, update) => (
      <div className="space-y-4">
        <div>
          <Label className={QUESTION_LABEL_CLASS}>Aantal melkkoeien:</Label>
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
          <Label className={QUESTION_LABEL_CLASS}>
            <TermWithTooltip
              term="Aantal hectares grond in gebruik (eigen + pacht):"
              explanation="Het totale aantal hectares landbouwgrond dat jij gebruikt voor jouw bedrijf (grasland, maïs e.d., exclusief gebouwen en erf)"
            />
          </Label>
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
    questionNumber: 6,
    title: "In welke fase bevindt jouw bedrijf zich?",
    subtitle: "Hoe zie je de ontwikkeling van jouw bedrijf in de komende jaren: groei, stabilisatie, overdracht of nog onzeker?",
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
    questionNumber: 7,
    title: "Welke ontwikkelingen hebben momenteel de meeste invloed op jouw bedrijfsvoering?",
    subtitle: "Denk aan wat op jouw melkveebedrijf het zwaarst weegt.",
    multiChoiceField: "q4",
    maxChoices: 3,
    required: true,
    render: (fd, update, toggleMulti) => {
      const selected = Array.isArray(fd.q4) ? fd.q4 : [];
      const selected4a = Array.isArray(fd.q4a) ? fd.q4a : [];
      const onToggleQ4 = (v: string) => {
        if (v === "Regelgeving" && selected.includes("Regelgeving")) {
          update({ q4a: [], q4a_anders: "" });
        }
        toggleMulti("q4", v, 3);
      };
      const onToggleQ4a = (v: string) => toggleMulti("q4a", v, 3);
      const showRegelgeving = selected.includes("Regelgeving");
      return (
        <div className="space-y-4">
          <p className={HELPER_TEXT_CLASS}>{selected.length}/3 gekozen</p>
          <div className="flex flex-wrap gap-2">
            {Q4_OPTIONS.map((opt) => {
              const isSelected = selected.includes(opt);
              const disabled = !isSelected && selected.length >= 3;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => !disabled && onToggleQ4(opt)}
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

          {showRegelgeving && (
            <div className="mt-6 space-y-2 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">Doorvragen:</p>
              <p className="text-sm font-medium text-foreground">
                Welke regelgeving heeft de meeste invloed op jouw bedrijfsvoering?
              </p>
              <p className={HELPER_TEXT_CLASS}>Kies maximaal 3 antwoorden.</p>
              <div className="flex flex-wrap gap-2">
                {Q4A_OPTIONS.map((opt) => {
                  const isSelected4a = selected4a.includes(opt);
                  const disabled4a = !isSelected4a && selected4a.length >= 3;
                  const tooltip = Q4A_TOOLTIPS[opt];
                  return (
                    <div key={opt} className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => !disabled4a && onToggleQ4a(opt)}
                        disabled={disabled4a}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-all ${
                          isSelected4a ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/50"
                        } ${disabled4a ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {opt}
                        {tooltip && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="inline-flex shrink-0 cursor-help"
                                tabIndex={0}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[260px]">
                              <p className="text-left">{tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
              {selected4a.includes("Anders, namelijk:") && (
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
          )}
        </div>
      );
    },
  });

  screens.push({
    id: "q4a",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 8,
    title: "Welke regelgeving speelt vooral?",
    subtitle: "Je hebt bij de vorige vraag 'Regelgeving' gekozen. Welke regels hebben op jouw melkveebedrijf de meeste impact? Meerdere antwoorden mogelijk.",
    multiChoiceField: "q4a",
    maxChoices: undefined,
    render: () => null,
  });

  screens.push({
    id: "q5",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 8,
    title: "Hoe belangrijk zijn verduurzaming, CO₂-reductie en biodiversiteit voor jouw bedrijf?",
    hasPiiField: true,
    render: (fd, update, _toggleMulti, setPiiBlocked) => (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className={QUESTION_LABEL_CLASS}>
            8a. In hoeverre is verduurzaming volgens jou van belang voor de continuïteit van je bedrijf?{" "}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex shrink-0 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Uitleg verduurzaming"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px]">
                <p className="text-left">
                  Verduurzaming: bijvoorbeeld minder uitstoot, kringlooplandbouw, meer biodiversiteit of aanpassing aan
                  klimaatverandering.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <ScaleSlider
            value={fd.q5a ?? 4}
            onValueChange={(v) => update({ q5a: v })}
            labelLeft="Nauwelijks van belang"
            labelRight="Van groot belang"
          />
        </div>

        <div className="space-y-2">
          <Label className={QUESTION_LABEL_CLASS}>
            8b. In hoeverre verwacht je dat CO₂-reductie invloed zal hebben op je bedrijf in de komende 10 jaar?{" "}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex shrink-0 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Uitleg CO₂-reductie"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px]">
                <p className="text-left">
                  CO₂-reductie: maatregelen of eisen om de uitstoot van broeikasgassen (methaan, CO₂ en lachgas) te
                  verminderen.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <ScaleSlider
            value={fd.q5b ?? 4}
            onValueChange={(v) => update({ q5b: v })}
            labelLeft="Nauwelijks invloed"
            labelRight="Veel invloed"
          />
        </div>

        <div className="space-y-2">
          <Label className={QUESTION_LABEL_CLASS}>
            8c. In hoeverre is biodiversiteit volgens jou relevant voor je bedrijfsvoering?{" "}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex shrink-0 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Uitleg biodiversiteit"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px]">
                <p className="text-left">
                  Biodiversiteit: variatie in planten en dieren op en rond je bedrijf, zoals kruidenrijk grasland,
                  landschapselementen of natuurbeheer.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <ScaleSlider
            value={fd.q5c ?? 4}
            onValueChange={(v) => update({ q5c: v })}
            labelLeft="Nauwelijks relevant"
            labelRight="Zeer relevant"
          />
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <Label className="mb-2 block text-sm font-medium text-foreground">Licht je antwoorden kort toe</Label>
          <PiiTextarea
            value={fd.q5_toelichting ?? ""}
            onChange={(v) => update({ q5_toelichting: v })}
            onPiiChange={setPiiBlocked}
            placeholder="Deze toelichting is optioneel."
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
    questionNumber: 9,
    title: "Als je 5–10 jaar vooruitkijkt: waar maak jij je dan het meeste zorgen over voor de toekomst van jouw bedrijf?",
    subtitle:
      "Denk bijvoorbeeld aan inkomen, beleid of regelgeving, klimaatverandering of opvolging.",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <PiiTextarea
        value={fd.q6 ?? ""}
        onChange={(v) => update({ q6: v })}
        onPiiChange={setPiiBlocked}
        placeholder="Beschrijf in je eigen woorden waar jij je de meeste zorgen over maakt."
        rows={4}
        maxLength={1000}
      />
    ),
  });

  screens.push({
    id: "q10_invloed_onderdelen",
    group: "Deel 2 – Huidige situatie en toekomstbeeld",
    questionNumber: 10,
    title: "In hoeverre heb je zelf invloed op de volgende onderdelen van jouw bedrijf in de komende jaren?",
    hasPiiField: true,
    render: (fd, update, _toggleMulti, setPiiBlocked) => (
      <div className="space-y-6">
        <div className="space-y-2">
          <p className={HELPER_TEXT_CLASS}>
            Schaal 1–7: links <span className="font-semibold text-foreground">nauwelijks invloed</span>, rechts{" "}
            <span className="font-semibold text-foreground">veel invloed</span>.
          </p>
        </div>

        <div className="space-y-4">
          <SliderRow
            label="Kostenstructuur"
            tooltip="bijv. voer, energie, mest"
            value={fd.q10_kostenstructuur ?? 4}
            onValueChange={(v) => update({ q10_kostenstructuur: v })}
          />
          <SliderRow
            label="Omvang van het bedrijf"
            tooltip="bijv. aantal melkkoeien, hectares"
            value={fd.q10_omvang ?? 4}
            onValueChange={(v) => update({ q10_omvang: v })}
          />
          <SliderRow
            label="Grondgebruik"
            tooltip="bijv. beweiding, gewassen, natuurmaatregelen"
            value={fd.q10_grondgebruik ?? 4}
            onValueChange={(v) => update({ q10_grondgebruik: v })}
          />
          <SliderRow
            label="Samenwerking met andere partijen"
            tooltip="bijv. keten, buren, coöperaties"
            value={fd.q10_samenwerking ?? 4}
            onValueChange={(v) => update({ q10_samenwerking: v })}
          />
          <SliderRow
            label="Afzet van producten"
            tooltip="bijv. zuivelverwerker, directe verkoop"
            value={fd.q10_afzet ?? 4}
            onValueChange={(v) => update({ q10_afzet: v })}
          />
          <SliderRow
            label="Verbreding"
            tooltip="bijv. energieopwekking, recreatie, nieuwe producten"
            value={fd.q10_verbreding ?? 4}
            onValueChange={(v) => update({ q10_verbreding: v })}
          />
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <Label className="mb-2 block text-sm font-medium text-foreground">Licht je antwoorden kort toe</Label>
          <PiiTextarea
            value={fd.q10_toelichting ?? ""}
            onChange={(v) => update({ q10_toelichting: v })}
            onPiiChange={setPiiBlocked}
            placeholder="Deze toelichting is optioneel."
            rows={3}
            maxLength={800}
          />
        </div>
      </div>
    ),
  });

  // Deel 3 – Veranderingen in bedrijfsvoering
  // Vraag 11 – matrix: aanpassingen per thema (Ja/Nee + verplichte toelichting per Ja)
  screens.push({
    id: "q11_matrix",
    group: "Deel 3 – Veranderingen in bedrijfsvoering",
    questionNumber: 11,
    title: "Heb je de afgelopen 5 jaar aanpassingen gedaan in jouw bedrijfsvoering op één of meer van de volgende gebieden?",
    subtitle: "Geef per onderwerp aan of je veranderingen hebt doorgevoerd. Bij elk gekozen 'Ja' is een korte toelichting verplicht.",
    hasPiiField: true,
    render: (fd, update, _toggleMulti, setPiiBlocked) => (
      <div className="space-y-6">
        {Q11_THEMES.map(({ key, keyToelichting, label }) => {
          const value = (fd[key] as string) ?? "";
          const toelichting = (fd[keyToelichting] as string) ?? "";
          return (
            <div key={key} className="space-y-3 rounded-lg border border-border p-4">
              <Label className="text-sm font-medium text-foreground">{label}</Label>
              <div className="flex flex-wrap items-center gap-4">
                <RadioGroup
                  value={value}
                  onValueChange={(v) => update({ [key]: v, [keyToelichting]: v === "Nee" ? "" : (fd[keyToelichting] as string) ?? "" })}
                  className="flex flex-row gap-6"
                >
                  <div className={OPTION_ROW_CLASS}>
                    <RadioGroupItem value="Ja" id={`${key}-ja`} />
                    <Label htmlFor={`${key}-ja`} className="cursor-pointer text-sm font-medium">Ja</Label>
                  </div>
                  <div className={OPTION_ROW_CLASS}>
                    <RadioGroupItem value="Nee" id={`${key}-nee`} />
                    <Label htmlFor={`${key}-nee`} className="cursor-pointer text-sm font-medium">Nee</Label>
                  </div>
                </RadioGroup>
              </div>
              {value === "Ja" && (
                <div className="mt-2">
                  <Label className="mb-1 block text-xs font-medium text-muted-foreground">Korte toelichting (verplicht)</Label>
                  <PiiTextarea
                    value={toelichting}
                    onChange={(v) => update({ [keyToelichting]: v } as Partial<UniveFormData>)}
                    onPiiChange={setPiiBlocked}
                    placeholder="Licht kort toe wat je hebt aangepast."
                    rows={2}
                    maxLength={400}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    ),
  });

  // Vraag 11b – alleen tonen bij minimaal 1 Ja bij vraag 11
  screens.push({
    id: "q11b",
    group: "Deel 3 – Veranderingen in bedrijfsvoering",
    questionNumber: 11,
    questionLabel: "11b",
    title: "Wat waren de belangrijkste aanleidingen voor deze aanpassingen?",
    subtitle: "Kies maximaal 2.",
    multiChoiceField: "q11b_aanleidingen",
    maxChoices: 2,
    hasPiiField: true,
    render: (fd, update, toggleMulti, setPiiBlocked) => {
      const selected = Array.isArray(fd.q11b_aanleidingen) ? fd.q11b_aanleidingen : [];
      return (
        <div className="space-y-4">
          <div>
            <p className={HELPER_TEXT_CLASS}>{selected.length}/2 gekozen</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Q11B_OPTIONS.map((opt) => {
                const isSelected = selected.includes(opt);
                const disabled = !isSelected && selected.length >= 2;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => !disabled && toggleMulti("q11b_aanleidingen", opt, 2)}
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
          </div>
          {selected.includes("Nieuwe regelgeving") && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <Label className="mb-2 block text-sm font-semibold text-foreground">Doorvragen: Welke regelgeving speelde hierbij een rol?</Label>
              <p className={HELPER_TEXT_CLASS}>Bijvoorbeeld stikstof, broeikasgassen, dierwelzijn, mest, etc.</p>
              <PiiTextarea
                value={fd.q11b_regelgeving ?? ""}
                onChange={(v) => update({ q11b_regelgeving: v })}
                onPiiChange={setPiiBlocked}
                placeholder="Beschrijf kort welke regelgeving"
                rows={3}
                maxLength={500}
                className="mt-2"
              />
            </div>
          )}
          {selected.includes("Anders, namelijk:") && (
            <div>
              <Label className={QUESTION_LABEL_CLASS}>Anders, namelijk:</Label>
              <Input
                value={fd.q11b_anders ?? ""}
                onChange={(e) => update({ q11b_anders: e.target.value })}
                placeholder="Toelichting"
                maxLength={200}
              />
            </div>
          )}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <Label className="mb-2 block text-sm font-medium text-foreground">Licht je antwoorden kort toe</Label>
            <PiiTextarea
              value={fd.q11b_toelichting ?? ""}
              onChange={(v) => update({ q11b_toelichting: v })}
              onPiiChange={setPiiBlocked}
              placeholder="Deze toelichting is optioneel."
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
      );
    },
  });

  // Vraag 12 – onder welke omstandigheden (verplicht)
  screens.push({
    id: "q10",
    group: "Deel 3 – Veranderingen in bedrijfsvoering",
    questionNumber: 12,
    title: "Onder welke omstandigheden zou je in de toekomst (opnieuw) aanpassingen in jouw bedrijfsvoering overwegen?",
    subtitle: "Denk bijvoorbeeld aan voldoende rendement, meer zekerheid, ondersteuning of duidelijk beleid.",
    hasPiiField: true,
    render: (fd, update, _, setPiiBlocked) => (
      <PiiTextarea
        value={fd.q10 ?? ""}
        onChange={(v) => update({ q10: v })}
        onPiiChange={setPiiBlocked}
        placeholder="Beschrijf onder welke omstandigheden je aanpassingen zou overwegen..."
        rows={4}
        maxLength={1000}
      />
    ),
  });

  // Vraag 13 – wat houdt tegen
  screens.push({
    id: "q11",
    group: "Deel 3 – Veranderingen in bedrijfsvoering",
    questionNumber: 13,
    title: "Wat houd je het meest tegen om aanpassingen te doen?",
    subtitle: "Denk aan wat je tegenhoudt om te verduurzamen of te investeren.",
    multiChoiceField: "q11",
    maxChoices: 2,
    required: true,
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
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${
                      isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/50"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <Label className="mb-2 block text-sm font-medium text-foreground">Licht je antwoorden kort toe</Label>
            <PiiTextarea
              value={fd.q11_toelichting ?? ""}
              onChange={(v) => update({ q11_toelichting: v })}
              onPiiChange={setPiiBlocked}
              placeholder="Deze toelichting is optioneel."
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
      );
    },
  });

  // Deel 4 – Welke ondersteuning zou helpen?
  // Vraag 14 – open voor vormen van ondersteuning (sliders 1–7, Andere ondersteuning zoals bij vraag 10)
  const Q14_OPEN_SLIDER_OPTIONS: { key: keyof UniveFormData; label: string }[] = [
    { key: "q14_open_eenmalig", label: "Eenmalige financiële bijdrage" },
    { key: "q14_open_structureel", label: "Structurele financiële vergoeding" },
    { key: "q14_open_pacht", label: "Pachtconstructies" },
    { key: "q14_open_co2", label: "Vergoedingen voor CO₂-vastlegging" },
    {
      key: "q14_open_premiekorting",
      label:
        "Premiekorting op verzekeringen bij CO₂-reductie, klimaatadaptatie of biodiversiteit herstel",
    },
  ];
  screens.push({
    id: "q14_open",
    group: "Deel 4 – Welke ondersteuning zou helpen?",
    questionNumber: 14,
    title:
      "In hoeverre sta je open voor de volgende vormen van ondersteuning vanuit Univé bij het ontwikkelen van een rendabel en duurzaam bedrijfsmodel?",
    subtitle:
      "Vanwege wet- en regelgeving wordt er aan verzekeraars gevraagd om de transitie naar duurzaamheid mogelijk te maken.",
    hasPiiField: true,
    render: (fd, update, _toggleMulti, setPiiBlocked) => (
      <div className="space-y-6">
        <p className={HELPER_TEXT_CLASS}>
          Schaal 1–7: links <span className="font-semibold text-foreground">sta ik niet voor open</span>, rechts{" "}
          <span className="font-semibold text-foreground">sta ik zeer voor open</span>.
        </p>
        <div className="space-y-4">
          {Q14_OPEN_SLIDER_OPTIONS.map(({ key, label }) => (
            <SliderRow
              key={key}
              label={label}
              value={(fd[key] as number) ?? 4}
              onValueChange={(v) => update({ [key]: v } as Partial<UniveFormData>)}
            />
          ))}
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <Label className="mb-2 block text-sm font-medium text-foreground">Licht je antwoorden kort toe</Label>
          <PiiTextarea
            value={fd.q14_open_toelichting ?? ""}
            onChange={(v) => update({ q14_open_toelichting: v })}
            onPiiChange={setPiiBlocked}
            placeholder="Deze toelichting is optioneel."
            rows={3}
            maxLength={500}
          />
        </div>
      </div>
    ),
  });

  // Vraag 15 – welke vormen ondersteuning waardevol (max 2, Anders namelijk verplicht)
  const Q15_WAARDEVOL_OPTIONS = [
    "Praktische begeleiding bij uitvoering",
    "Kennis en advies",
    "Ontzorging bij administratie en regelgeving",
    "Langjarige afspraken",
    "Ondersteuning bij samenwerking met andere partijen",
    "Anders, namelijk:",
  ];
  screens.push({
    id: "q15_waardevol",
    group: "Deel 4 – Welke ondersteuning zou helpen?",
    questionNumber: 15,
    title:
      "Naast financiële ondersteuning, welke vormen van ondersteuning zouden voor jou het meest waardevol zijn bij aanpassingen in jouw bedrijfsvoering?",
    multiChoiceField: "q15_waardevol",
    maxChoices: 2,
    required: true,
    hasPiiField: true,
    render: (fd, update, toggleMulti, setPiiBlocked) => {
      const selected = Array.isArray(fd.q15_waardevol) ? fd.q15_waardevol : [];
      return (
        <div className="space-y-4">
          <p className={HELPER_TEXT_CLASS}>{selected.length}/2 gekozen</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Q15_WAARDEVOL_OPTIONS.map((opt) => {
              const isSelected = selected.includes(opt);
              const disabled = !isSelected && selected.length >= 2;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => !disabled && toggleMulti("q15_waardevol", opt, 2)}
                  disabled={disabled}
                  className={`rounded-full border px-4 py-2 text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {selected.includes("Anders, namelijk:") && (
            <div className="mt-3">
              <Label className={`${QUESTION_LABEL_CLASS} after:content-['*'] after:text-destructive`}>
                Anders, namelijk: (verplicht)
              </Label>
              <Input
                value={fd.q15_waardevol_anders ?? ""}
                onChange={(e) => update({ q15_waardevol_anders: e.target.value })}
                placeholder="Vul in wat van toepassing is"
                maxLength={200}
              />
            </div>
          )}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <Label className="mb-2 block text-sm font-medium text-foreground">Licht je antwoorden kort toe</Label>
            <PiiTextarea
              value={fd.q15_waardevol_toelichting ?? ""}
              onChange={(v) => update({ q15_waardevol_toelichting: v })}
              onPiiChange={setPiiBlocked}
              placeholder="Deze toelichting is optioneel."
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
      );
    },
  });

  // Vraag 16a – welke opties overwegen (meerdere antwoorden, min 1 verplicht)
  screens.push({
    id: "q16a",
    group: "Deel 4 – Welke ondersteuning zou helpen?",
    questionNumber: 16,
    questionLabel: "16a",
    title: "Welke van de volgende opties zou je eventueel overwegen op jouw bedrijf?",
    subtitle:
      "Sommige melkveehouders verkennen aanvullende vormen van landgebruik of nieuwe activiteiten die kunnen bijdragen aan duurzaamheid en een aanvullend verdienmodel. (Meerdere antwoorden mogelijk)",
    multiChoiceField: "q16a",
    required: true,
    render: (fd, update, toggleMulti) => {
      const selected = Array.isArray(fd.q16a) ? fd.q16a : [];
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Q16A_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleMulti("q16a", opt)}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  selected.includes(opt)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {selected.includes("Anders, namelijk:") && (
            <div className="mt-3">
              <Label className={`${QUESTION_LABEL_CLASS} after:content-['*'] after:text-destructive`}>
                Anders, namelijk: (verplicht)
              </Label>
              <Input
                value={fd.q16a_anders ?? ""}
                onChange={(e) => update({ q16a_anders: e.target.value })}
                placeholder="Vul in wat van toepassing is"
                maxLength={200}
              />
            </div>
          )}
        </div>
      );
    },
  });

  // Vraag 16b – top 3 toepassen (max 3); volgorde = 1e, 2e, 3e keuze
  screens.push({
    id: "q16b",
    group: "Deel 4 – Welke ondersteuning zou helpen?",
    questionNumber: 16,
    questionLabel: "16b",
    title: "Welke opties zou je dan het liefst toepassen op jouw bedrijf?",
    subtitle:
      "Stel dat deze activiteiten financieel rendabel zijn. Geef een top 3 door in volgorde van voorkeur te klikken: eerst je eerste keuze, daarna je tweede en je derde keuze.",
    multiChoiceField: "q16b",
    maxChoices: 3,
    required: true,
    render: (fd, update, toggleMulti) => {
      const selected = Array.isArray(fd.q16b) ? fd.q16b : [];
      return (
        <div className="space-y-4">
          <p className={HELPER_TEXT_CLASS}>{selected.length}/3 gekozen.</p>
          <div className="flex flex-wrap gap-2">
            {Q16A_OPTIONS.map((opt) => {
              const isSelected = selected.includes(opt);
              const rank = isSelected ? selected.indexOf(opt) + 1 : 0;
              const disabled = !isSelected && selected.length >= 3;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => !disabled && toggleMulti("q16b", opt, 3)}
                  disabled={disabled}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSelected && (
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                      aria-label={`${rank}e keuze`}
                    >
                      {rank}
                    </span>
                  )}
                  {opt}
                </button>
              );
            })}
          </div>
          {selected.includes("Anders, namelijk:") && (
            <div className="mt-3">
              <Label className={`${QUESTION_LABEL_CLASS} after:content-['*'] after:text-destructive`}>
                Anders, namelijk: (verplicht)
              </Label>
              <Input
                value={fd.q16b_anders ?? ""}
                onChange={(e) => update({ q16b_anders: e.target.value })}
                placeholder="Vul in wat van toepassing is"
                maxLength={200}
              />
            </div>
          )}
        </div>
      );
    },
  });

  // Vraag 17a – behoefte aanvullende inkomsten of risicospreiding (1 slider)
  screens.push({
    id: "q17a",
    group: "Deel 4 – Welke ondersteuning zou helpen?",
    questionNumber: 17,
    questionLabel: "17a",
    title: "In hoeverre heb je behoefte aan aanvullende inkomsten of meer risicospreiding?",
    render: (fd, update) => (
      <div className="space-y-4">
        <p className={HELPER_TEXT_CLASS}>
          Schaal 1–7: links <span className="font-semibold text-foreground">geen behoefte</span>, rechts{" "}
          <span className="font-semibold text-foreground">sterke behoefte</span>.
        </p>
        <ScaleSlider
          value={fd.q17a ?? 4}
          onValueChange={(v) => update({ q17a: v })}
          labelLeft="Geen behoefte"
          labelRight="Sterke behoefte"
        />
      </div>
    ),
  });

  // Vraag 17b – mogelijkheden per richting (sliders 1–7 + Anders namelijk)
  const Q17B_SLIDER_OPTIONS: { key: keyof UniveFormData; label: string }[] = [
    {
      key: "q17b_directe_verkoop",
      label:
        "Directe verkoop van producten (bijv. melk, zuivelproducten of andere producten van het bedrijf)",
    },
    {
      key: "q17b_nieuwe_teelten",
      label: "Nieuwe teelten (bijv. noten, fruit of hennep)",
    },
    { key: "q17b_co2", label: "Vergoeding voor CO₂-vastlegging" },
    {
      key: "q17b_natuur_biodiversiteit",
      label: "Vergoedingen voor natuur- en biodiversiteitsbeheer",
    },
  ];
  screens.push({
    id: "q17b",
    group: "Deel 4 – Welke ondersteuning zou helpen?",
    questionNumber: 17,
    questionLabel: "17b",
    title:
      "In hoeverre zie je op jouw bedrijf mogelijkheden in de volgende richtingen om jouw inkomsten te verbreden of risico's te spreiden?",
    hasPiiField: true,
    render: (fd, update, _toggleMulti, setPiiBlocked) => (
      <div className="space-y-6">
        <p className={HELPER_TEXT_CLASS}>
          Schaal 1–7: links <span className="font-semibold text-foreground">geen mogelijkheden</span>, rechts{" "}
          <span className="font-semibold text-foreground">veel mogelijkheden</span>.
        </p>
        <div className="space-y-4">
          {Q17B_SLIDER_OPTIONS.map(({ key, label }) => (
            <SliderRow
              key={key}
              label={label}
              value={(fd[key] as number) ?? 4}
              onValueChange={(v) => update({ [key]: v } as Partial<UniveFormData>)}
            />
          ))}
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <Label className="mb-2 block text-sm font-medium text-foreground">Licht je antwoorden kort toe</Label>
          <PiiTextarea
            value={fd.q17_toelichting ?? ""}
            onChange={(v) => update({ q17_toelichting: v })}
            onPiiChange={setPiiBlocked}
            placeholder="Deze toelichting is optioneel."
            rows={3}
            maxLength={500}
          />
        </div>
      </div>
    ),
  });

  // Deel 5 – Verdienmodel en kwetsbaarheden


  const Q16_SLIDER_OPTIONS: { key: keyof UniveFormData; label: string; tooltip: string }[] = [
    {
      key: "q16_marge",
      label: "Voldoende inkomen / marge uit het bedrijf",
      tooltip: "Na kosten en aflossingen genoeg overhouden om te kunnen ondernemen en tegenvallers op te vangen.",
    },
    {
      key: "q16_stabiliteit",
      label: "Stabiel inkomen / weinig schommelingen",
      tooltip: "Zo min mogelijk grote schommelingen in opbrengsten, kosten of inkomsten door het jaar heen.",
    },
    {
      key: "q16_schuldenlast",
      label: "Lage schuldenlast",
      tooltip: "Een schuldniveau dat past bij jouw bedrijf en waarbij je je comfortabel voelt.",
    },
    {
      key: "q16_continuïteit",
      label: "Continuïteit voor de volgende generatie",
      tooltip: "Het bedrijf in zo’n staat achterlaten dat een volgende generatie goed kan doorgaan.",
    },
    {
      key: "q16_voortzetten",
      label: "Het bedrijf op de huidige manier kunnen voortzetten",
      tooltip: "Je bedrijf grotendeels kunnen blijven runnen zoals nu, binnen de regels en met voldoende inkomen.",
    },
    {
      key: "q16_waardebehoud",
      label: "Waardebehoud van grond en bedrijf",
      tooltip: "Dat je grond, gebouwen en bedrijf hun waarde behouden of op termijn niet sterk dalen.",
    },
  ];
  screens.push({
    id: "q16",
    group: "Deel 5 – Verdienmodel en kwetsbaarheden",
    questionNumber: 18,
    title: "Wat betekent rendabel ondernemen voor jou?",
    hasPiiField: true,
    render: (fd, update, _toggleMulti, setPiiBlocked) => (
      <div className="space-y-5">
        <p className={HELPER_TEXT_CLASS}>
          Schaal 1–7: links <span className="font-semibold text-foreground">weinig belangrijk</span>, rechts{" "}
          <span className="font-semibold text-foreground">zeer belangrijk</span>.
        </p>
        {Q16_SLIDER_OPTIONS.map(({ key, label, tooltip }) => (
          <SliderRow
            key={key}
            label={label}
            value={(fd[key] as number) ?? 4}
            tooltip={tooltip}
            onValueChange={(v) => update({ [key]: v } as Partial<UniveFormData>)}
          />
        ))}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <Label className="mb-2 block text-sm font-medium text-foreground">Licht je antwoorden kort toe</Label>
          <PiiTextarea
            value={fd.q16_toelichting ?? ""}
            onChange={(v) => update({ q16_toelichting: v })}
            onPiiChange={setPiiBlocked}
            placeholder="Deze toelichting is optioneel."
            rows={3}
            maxLength={500}
          />
        </div>
      </div>
    ),
  });

  // Deel 6 – Afsluiting

  // Vraag 19a & 19b – optionele aanvullende opmerkingen (twee open vragen op één pagina)
  screens.push({
    id: "q19a_19b",
    group: "Deel 6 – Afsluiting",
    questionNumber: 25,
    questionLabel: "19",
    title: "Feedback voor Univé",
    hasPiiField: true,
    required: false,
    render: (fd, update, _toggleMulti, setPiiBlocked) => (
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <Label className={QUESTION_LABEL_CLASS}>
            Heeft u nog opmerkingen of feedback voor Univé zelf?
          </Label>
          <PiiTextarea
            value={fd.q19a ?? ""}
            onChange={(v) => update({ q19a: v })}
            onPiiChange={setPiiBlocked}
            placeholder="Deze toelichting is optioneel."
            rows={4}
            maxLength={1000}
            className="mt-2"
          />
        </div>
        <div className="space-y-2">
          <h2 className="mb-1 text-xl font-semibold text-foreground">Feedback vragenlijst</h2>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <Label className={QUESTION_LABEL_CLASS}>
              Heeft u nog opmerkingen of feedback over deze vragenlijst?
            </Label>
            <PiiTextarea
              value={fd.q19b ?? ""}
              onChange={(v) => update({ q19b: v })}
              onPiiChange={setPiiBlocked}
              placeholder="Deze toelichting is optioneel."
              rows={4}
              maxLength={1000}
              className="mt-2"
            />
          </div>
        </div>
      </div>
    ),
  });

  // Vraag 20 – openstaan voor contact (na 19a/19b)
  screens.push({
    id: "q19",
    group: "Deel 6 – Afsluiting",
    questionNumber: 20,
    title:
      "Sta je ervoor open dat er mogelijk contact met je wordt opgenomen naar aanleiding van de vragenlijst in het vervolg van Univé's onderzoek?",
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
            {toestemming === "Ja" && (
              <div className="space-y-4 pl-9">
                <p className={HELPER_TEXT_CLASS}>
                  Let op: als je deze optie kiest, is je deelname <span className="font-semibold underline">niet meer anoniem</span>. We koppelen je naam en
                  contactgegevens aan jouw antwoorden zodat we je later kunnen benaderen over deze vragenlijst
                  of ondersteuning.
                </p>
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
            <div className={OPTION_ROW_CLASS}>
              <RadioGroupItem value="Nee" id="q19-nee" />
              <Label htmlFor="q19-nee" className="flex-1 cursor-pointer text-sm font-medium">
                Nee, liever niet
              </Label>
            </div>
          </RadioGroup>
        </div>
      );
    },
  });

  // Vraag 21 – verloting boerenpakket (e-mail alleen voor winactie; niet gekoppeld aan antwoorden)
  screens.push({
    id: "q21",
    group: "Deel 6 – Afsluiting",
    questionNumber: 21,
    title: "Wil je meedoen aan de verloting van een boerenpakket onder de deelnemers aan deze vragenlijst?",
    render: (fd, update) => {
      const verloting = fd.q21_verloting ?? "";
      return (
        <div className="space-y-5">
          <RadioGroup
            value={verloting}
            onValueChange={(v) => update({ q21_verloting: v, ...(v !== "Ja" ? { q21_email: "" } : {}) })}
            className="space-y-2"
          >
            <div className={OPTION_ROW_CLASS}>
              <RadioGroupItem value="Ja" id="q21-ja" />
              <Label htmlFor="q21-ja" className="flex-1 cursor-pointer text-sm font-medium">
                Ja, ik doe graag mee
              </Label>
            </div>
            <div className={OPTION_ROW_CLASS}>
              <RadioGroupItem value="Nee" id="q21-nee" />
              <Label htmlFor="q21-nee" className="flex-1 cursor-pointer text-sm font-medium">
                Nee
              </Label>
            </div>
          </RadioGroup>
          {verloting === "Ja" && (
            <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
              <Label className={QUESTION_LABEL_CLASS}>
                Zo ja: Laat hier je e-mailadres achter zodat wij contact kunnen opnemen als je wint.
              </Label>
              <div>
                <Label htmlFor="q21_email" className={`${QUESTION_LABEL_CLASS} mt-2`}>
                  E-mailadres
                </Label>
                <Input
                  id="q21_email"
                  type="email"
                  value={fd.q21_email ?? ""}
                  onChange={(e) => update({ q21_email: e.target.value })}
                  placeholder="bijvoorbeeld: boer@voorbeeld.nl"
                  maxLength={200}
                  className="mt-2 w-full"
                  aria-label="E-mailadres voor de verloting"
                />
              </div>
              <p className="text-sm italic text-muted-foreground">
                (Je gegevens worden alleen hiervoor gebruikt en niet gekoppeld aan je antwoorden.)
              </p>
            </div>
          )}
        </div>
      );
    },
  });

  return screens;
}

export function isUniveStepValid(screen: UniveScreen, fd: UniveFormData, piiBlocked: boolean): boolean {
  const countWords = (value: unknown): number => {
    if (typeof value !== "string") return 0;
    const trimmed = value.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  };

  if (piiBlocked && screen.hasPiiField) return false;
  if (screen.required === false) return true;
  if (screen.id === "q0_gemeente") {
    const gemeente = typeof fd.q0_gemeente === "string" ? fd.q0_gemeente.trim() : "";
    return gemeente.length > 0;
  }
  if (screen.id === "q2") {
    const cows = Number(fd.q2_cows);
    const hectares = Number(fd.q2_hectares);
    // Beide velden verplicht: minimaal > 0 ingevuld
    const validCows = Number.isFinite(cows) && cows > 0;
    const validHectares = Number.isFinite(hectares) && hectares > 0;
    return validCows && validHectares;
  }
  if (screen.id === "q1") {
    const keuze = typeof fd.q1 === "string" ? fd.q1.trim() : "";
    if (!keuze) return false;
    if (keuze === "Anders") {
      const anders = typeof fd.q1_anders === "string" ? fd.q1_anders.trim() : "";
      if (!anders) return false;
    }
    if (keuze === "In omschakeling") {
      const omschakeling = typeof fd.q1_omschakeling === "string" ? fd.q1_omschakeling.trim() : "";
      if (!omschakeling) return false;
      if (omschakeling === "Anders, namelijk:") {
        const andersOmschakeling =
          typeof fd.q1_omschakeling_anders === "string" ? fd.q1_omschakeling_anders.trim() : "";
        if (!andersOmschakeling) return false;
      }
    }
  }
  if (screen.id === "q11_matrix") {
    // Hoofdthema's: bij elke 'Ja' is een korte toelichting (min. 2 woorden) verplicht
    const themes: { key: keyof UniveFormData; keyToelichting: keyof UniveFormData }[] = [
      { key: "q11_duurzaamheid", keyToelichting: "q11_duurzaamheid_toelichting" },
      { key: "q11_bedrijfsschaal", keyToelichting: "q11_bedrijfsschaal_toelichting" },
      { key: "q11_bedrijfsvoering", keyToelichting: "q11_bedrijfsvoering_toelichting" },
      { key: "q11_verdienmodel", keyToelichting: "q11_verdienmodel_toelichting" },
      { key: "q11_investeringen", keyToelichting: "q11_investeringen_toelichting" },
    ];
    for (const { key, keyToelichting } of themes) {
      const val = (fd[key] as string) ?? "";
      if (val !== "Ja" && val !== "Nee") return false;
      if (val === "Ja") {
        const toelichting = (fd[keyToelichting] as string) ?? "";
        if (countWords(toelichting) < 2) return false;
      }
    }
    return true;
  }
  if (screen.id === "q11b") {
    const q11b = Array.isArray(fd.q11b_aanleidingen) ? fd.q11b_aanleidingen : [];
    if (q11b.length === 0) return false;
    if (q11b.includes("Nieuwe regelgeving")) {
      const reg = typeof fd.q11b_regelgeving === "string" ? fd.q11b_regelgeving.trim() : "";
      if (!reg) return false;
    }
    if (q11b.includes("Anders, namelijk:")) {
      const anders = typeof fd.q11b_anders === "string" ? fd.q11b_anders.trim() : "";
      if (!anders) return false;
    }
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
  if (screen.id === "q21") {
    const verloting = typeof fd.q21_verloting === "string" ? fd.q21_verloting.trim() : "";
    if (!verloting) return false;
    if (verloting === "Ja") {
      const email = typeof fd.q21_email === "string" ? fd.q21_email : "";
      if (!email || !email.includes("@")) return false;
    }
    return true;
  }
  if (screen.id === "q6") {
    const words = countWords(fd.q6);
    return words >= 2;
  }
  if (screen.id === "q10") {
    const words = countWords(fd.q10);
    return words >= 2;
  }
  if (screen.id === "q4") {
    const q4 = Array.isArray(fd.q4) ? fd.q4 : [];
    if (q4.length === 0) return false;
    if (q4.includes("Anders, namelijk:")) {
      const anders = typeof fd.q4_anders === "string" ? fd.q4_anders.trim() : "";
      if (!anders) return false;
    }
    if (q4.includes("Regelgeving")) {
      const q4a = Array.isArray(fd.q4a) ? fd.q4a : [];
      if (q4a.length === 0) return false;
      if (q4a.length > 3) return false;
      if (q4a.includes("Anders, namelijk:")) {
        const anders = typeof fd.q4a_anders === "string" ? fd.q4a_anders.trim() : "";
        if (!anders) return false;
      }
    }
  }
  if (screen.id === "q4a") {
    const q4a = Array.isArray(fd.q4a) ? fd.q4a : [];
    if (q4a.includes("Anders, namelijk:")) {
      const anders = typeof fd.q4a_anders === "string" ? fd.q4a_anders.trim() : "";
      if (!anders) return false;
    }
  }
  if (screen.id === "q11") {
    const q11 = Array.isArray(fd.q11) ? fd.q11 : [];
    if (q11.length < 1) return false;
    if (q11.includes("Anders, namelijk:")) {
      const anders = typeof fd.q11_anders === "string" ? fd.q11_anders.trim() : "";
      if (!anders) return false;
    }
  }
  if (screen.id === "q15_waardevol") {
    const q15w = Array.isArray(fd.q15_waardevol) ? fd.q15_waardevol : [];
    if (q15w.length < 1) return false;
    if (q15w.includes("Anders, namelijk:")) {
      const anders = typeof fd.q15_waardevol_anders === "string" ? fd.q15_waardevol_anders.trim() : "";
      if (!anders) return false;
    }
    return true;
  }
  if (screen.id === "q16a") {
    const q16a = Array.isArray(fd.q16a) ? fd.q16a : [];
    if (q16a.length < 1) return false;
    if (q16a.includes("Anders, namelijk:")) {
      const anders = typeof fd.q16a_anders === "string" ? fd.q16a_anders.trim() : "";
      if (!anders) return false;
    }
    return true;
  }
  if (screen.id === "q16b") {
    const q16b = Array.isArray(fd.q16b) ? fd.q16b : [];
    if (q16b.length !== 3) return false;
    if (q16b.includes("Anders, namelijk:")) {
      const anders = typeof fd.q16b_anders === "string" ? fd.q16b_anders.trim() : "";
      if (!anders) return false;
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

function hasAnyQ11Ja(fd: UniveFormData): boolean {
  return (
    fd.q11_duurzaamheid === "Ja" ||
    fd.q11_bedrijfsschaal === "Ja" ||
    fd.q11_bedrijfsvoering === "Ja" ||
    fd.q11_verdienmodel === "Ja" ||
    fd.q11_investeringen === "Ja"
  );
}

/** Of dit scherm alleen getoond wordt onder een voorwaarde (q4a, q11b). q4a is altijd verborgen: inhoud staat inlined op q4. */
export function isStepConditionallyHidden(screenId: string, fd: UniveFormData): boolean {
  if (screenId === "q4a") return true;
  if (screenId === "q11b") return !hasAnyQ11Ja(fd);
  if (screenId === "q9") {
    const q8 = typeof fd.q8 === "string" ? fd.q8.trim() : "";
    return q8 !== "Ja, meerdere" && q8 !== "Ja, beperkt";
  }
  return false;
}
