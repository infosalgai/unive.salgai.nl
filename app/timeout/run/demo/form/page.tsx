\"use client\"

import React from \"react\"
import { useState, useEffect, useRef, useCallback } from \"react\"
import { useRouter, useSearchParams } from \"next/navigation\"
import { Button } from \"@/components/ui/button\"
import { Card, CardContent } from \"@/components/ui/card\"
import { Slider } from \"@/components/ui/slider\"
import { Textarea } from \"@/components/ui/textarea\"
import { Input } from \"@/components/ui/input\"
import { RadioGroup, RadioGroupItem } from \"@/components/ui/radio-group\"
import { Label } from \"@/components/ui/label\"
import { Checkbox } from \"@/components/ui/checkbox\"
import { NavHeader } from \"@/components/nav-header\"
import { AppFooter } from \"@/components/app-footer\"
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Send, Info } from \"lucide-react\"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from \"@/components/ui/dialog\"
import { Tooltip, TooltipContent, TooltipTrigger } from \"@/components/ui/tooltip\"
import { getDemoContext } from \"@/lib/demo-data\"

// ── Options ──

const HOOFDOORZAAK_OPTIONS = [
  { id: "werkdruk", label: "Werkdruk / stress" },
  { id: "samenwerking", label: "Samenwerking of conflict" },
  { id: "prive", label: "Privé-omstandigheden" },
  { id: "energie", label: "Energie (fysiek of mentaal)" },
  { id: "combinatie", label: "Combinatie werk en privé" },
  { id: "incident", label: "Een incident" },
  { id: "anders", label: "Anders" },
]

const FACTOREN_PRIVE = [
  "Mantelzorg",
  "Relatie / thuissituatie",
  "Kinderen / gezin",
  "Financiële zorgen",
  "Rouw / verlies",
]

const FACTOREN_WERK = [
  "Slaapproblemen / uitputting",
  "Lichamelijke klachten",
  "Onzekerheid / angst / piekeren",
  "Werkdruk / uren",
  "Conflict op werk",
]

const SINDS_OPTIONS = [
  { id: "vandaag", label: "Vandaag" },
  { id: "dagen", label: "Enkele dagen" },
  { id: "weken", label: "Enkele weken" },
  { id: "maanden", label: "Enkele maanden" },
  { id: "langer", label: "Langer dan 6 maanden" },
]

const SIGNALEN_OPTIONS = [
  "Minder energie",
  "Minder concentratie",
  "Emotioneel reageren",
  "Meer fouten",
  "Terugtrekken",
  "Fysieke klachten",
]

const DOEL_OPTIONS = [
  "Rust en overzicht krijgen",
  "Helder krijgen wat er echt speelt",
  "Concrete stappen voor de komende 1-2 weken",
  "Grenzen en afspraken bepalen",
  "Gesprek met werk voorbereiden",
  "Samen oplossingen bespreken",
  "Bepalen of time-out voldoende is",
]

const WERKDRUK_DRUK = [
  "Te veel taken",
  "Deadlines / tempo",
  "Onderbezetting",
  "Emotioneel belastend werk",
  "Weinig invloed",
  "Onduidelijke prioriteiten",
]

const WERKDRUK_DUUR = [
  { id: "kort", label: "Kort" },
  { id: "weken", label: "Enkele weken" },
  { id: "maanden", label: "Enkele maanden" },
  { id: "lang", label: "Langere tijd" },
]

const WERKDRUK_GEPROBEERD = [
  "Gesprek collega",
  "Gesprek leidinggevende",
  "Taken aangepast",
  "Uren aangepast",
  "Rust genomen",
  "Nog niets",
]

const WERKDRUK_HELPT = [
  { id: "minder-taken", label: "Minder taken" },
  { id: "duidelijkheid", label: "Meer duidelijkheid" },
  { id: "rust", label: "Tijdelijke rust" },
  { id: "sparren", label: "Iemand om mee te sparren" },
  { id: "anders", label: "Anders" },
]

const CONFLICT_MET = [
  { id: "collega", label: "Collega" },
  { id: "leidinggevende", label: "Leidinggevende" },
  { id: "team", label: "Team" },
  { id: "extern", label: "Externe partij" },
]

const CONFLICT_WAAROVER = [
  "Communicatie",
  "Verwachtingen",
  "Gedrag / veiligheid",
  "Beoordeling",
  "Grenzen",
  "Vertrouwen",
]

const CONFLICT_UITKOMST = [
  { id: "voorbereiden", label: "Gesprek voorbereiden" },
  { id: "bemiddeling", label: "Bemiddeling" },
  { id: "grenzen", label: "Grenzen bepalen" },
  { id: "ordenen", label: "Verhaal ordenen" },
]

const PRIVE_WAAROVER = [
  "Mantelzorg",
  "Relatie / thuissituatie",
  "Kinderen / gezin",
  "Gezondheid",
  "Rouw / verlies",
  "Financiën",
  "Wonen",
]

const PRIVE_NODIG = [
  "Flexibele werktijden",
  "Minder uren",
  "Thuiswerken",
  "Andere taken",
  "Rust zonder uitleg",
  "Duidelijke afbakening",
]

const ENERGIE_MERKT = [
  "Vermoeidheid",
  "Slecht slapen",
  "Overprikkeld",
  "Pijn",
  "Piekeren / angst",
  "Herstel gaat traag",
]

const CLOSING_OPTIONS = [
  "Meer rust en ruimte",
  "Flexibele werktijden",
  "Tijdelijk minder uren",
  "Praktische hulp bij planning",
  "Iemand om mee te sparren",
  "Duidelijke grenzen en prioriteiten",
]

const TERUGKOPPELING_OPTIONS = [
  { id: "praktisch", label: "Ja, alleen praktisch (uren / taken / planning)" },
  { id: "thema", label: "Ja, ook het hoofdthema in één zin" },
  { id: "na-gesprek", label: "Ja, maar pas na het Time-out gesprek" },
  { id: "nee", label: "Nee, nog niet" },
]

// ── Form state ──
interface FormData {
  hoofdoorzaak: string
  andersText: string
  zwaarte: number
  hoofdoorzaakToelichting: string
  factoren: string[]
  factorenToelichting: string
  sinds: string
  risico: number
  signalen: string[]
  signalenToelichting: string
  doelen: string[]
  doelenToelichting: string
  belangrijkheid: number
  werkdrukDruk: string[]
  werkdrukDuur: string
  werkdrukGeprobeerd: string[]
  werkdrukHelpt: string
  werkdrukHelptAnders: string
  conflictMet: string
  conflictWaarover: string[]
  conflictVeilig: number
  conflictContact: string
  conflictUitkomst: string
  priveWaarover: string[]
  priveDelen: string
  priveDelenText: string
  priveNodig: string[]
  mantelzorgVoor: string
  mantelzorgZwaar: number
  mantelzorgKnelt: string
  relatieWat: string
  relatieMerkt: string
  kinderenWat: string
  kinderenKnelpunt: string
  energieMerkt: string[]
  energieZorg: string[]
  energieHulp: string
  combinatieVerdeling: number
  combinatieVerandering: string
  closingNodig: string[]
  closingToelichting: string
  closingBelangrijk: number
  randWelBereiken: string
  randNietBereiken: string
  terugkoppeling: string
  terugkoppelingAkkoord: boolean
}

const initialFormData: FormData = {
  hoofdoorzaak: "",
  andersText: "",
  zwaarte: 4,
  hoofdoorzaakToelichting: "",
  factoren: [],
  factorenToelichting: "",
  sinds: "",
  risico: 4,
  signalen: [],
  signalenToelichting: "",
  doelen: [],
  doelenToelichting: "",
  belangrijkheid: 4,
  werkdrukDruk: [],
  werkdrukDuur: "",
  werkdrukGeprobeerd: [],
  werkdrukHelpt: "",
  werkdrukHelptAnders: "",
  conflictMet: "",
  conflictWaarover: [],
  conflictVeilig: 4,
  conflictContact: "",
  conflictUitkomst: "",
  priveWaarover: [],
  priveDelen: "",
  priveDelenText: "",
  priveNodig: [],
  mantelzorgVoor: "",
  mantelzorgZwaar: 4,
  mantelzorgKnelt: "",
  relatieWat: "",
  relatieMerkt: "",
  kinderenWat: "",
  kinderenKnelpunt: "",
  energieMerkt: [],
  energieZorg: [],
  energieHulp: "",
  combinatieVerdeling: 50,
  combinatieVerandering: "",
  closingNodig: [],
  closingToelichting: "",
  closingBelangrijk: 4,
  randWelBereiken: "",
  randNietBereiken: "",
  terugkoppeling: "",
  terugkoppelingAkkoord: false,
}

// ── Reusable components ──

function SelectCard({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
        selected
          ? "border-primary bg-primary/5 text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/50"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

function CheckboxList({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
        >
          <Checkbox checked={selected.includes(opt)} onCheckedChange={() => onToggle(opt)} />
          <span className="text-sm text-muted-foreground">{opt}</span>
        </label>
      ))}
    </div>
  )
}

function ChipSelect({ options, selected, onToggle, max }: { options: string[]; selected: string[]; onToggle: (v: string) => void; max?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt)
        const isDisabled = !isSelected && max !== undefined && selected.length >= max
        return (
          <button
            key={opt}
            type="button"
            onClick={() => !isDisabled && onToggle(opt)}
            disabled={isDisabled}
            className={`rounded-full border px-4 py-2 text-sm transition-all ${
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : isDisabled
                  ? "cursor-not-allowed border-border bg-card text-muted-foreground/40"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function ScaleSlider({ value, onChange, labelLeft, labelMid, labelRight }: { value: number; onChange: (v: number) => void; labelLeft: string; labelMid: string; labelRight: string }) {
  return (
    <div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={1} max={7} step={1} className="w-full" />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>1 = {labelLeft}</span>
        <span>4 = {labelMid}</span>
        <span>7 = {labelRight}</span>
      </div>
    </div>
  )
}

// ── Step definition ──
// Each "screen" the user sees is one focused question block

type Topic = "Medische gezondheid" | "Psychische gezondheid" | "Sociale gezondheid"

interface Screen {
  id: string
  group: string // For the top progress bar
  title: string
  subtitle?: string
  topic: Topic
  tooltip: string
  optionalNoteField?: keyof FormData
  render: (
    fd: FormData,
    update: (p: Partial<FormData>) => void,
    toggleMulti: (field: keyof FormData, value: string, max?: number) => void,
  ) => React.ReactNode
  isVisible?: (fd: FormData) => boolean
}

function buildScreens(): Screen[] {
  return [
    // ─── GROUP 1: SITUATIE ───
    {
      id: "hoofdoorzaak",
      group: "Situatie",
      title: "Wat brengt jou tot deze aanvraag?",
      subtitle: "Kies wat nu het meest speelt.",
      topic: "Psychische gezondheid",
      tooltip: "Hier gaat het om wat jou vooral richting een time-out brengt, zonder in medische details te gaan.",
      optionalNoteField: "hoofdoorzaakToelichting",
      render: (fd, update) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {HOOFDOORZAAK_OPTIONS.map((opt) => (
              <SelectCard
                key={opt.id}
                selected={fd.hoofdoorzaak === opt.id}
                onClick={() => update({ hoofdoorzaak: opt.id })}
                label={opt.label}
              />
            ))}
          </div>
          {fd.hoofdoorzaak === "anders" && (
            <div className="mt-4 space-y-3">
              <Input
                value={fd.andersText}
                onChange={(e) => update({ andersText: e.target.value })}
                placeholder="Kort omschrijven..."
                maxLength={100}
              />
            </div>
          )}
          <div className="mt-6 space-y-4">
            <div>
              <Label className="mb-2 block text-sm">Hoe zwaar voelt dit nu voor je?</Label>
              <ScaleSlider
                value={fd.zwaarte}
                onChange={(v) => update({ zwaarte: v })}
                labelLeft="Licht"
                labelMid="Gemiddeld"
                labelRight="Zeer zwaar"
              />
            </div>
          </div>
        </>
      ),
    },
    {
      id: "factoren",
      group: "Situatie",
      title: "Spelen er nog andere factoren mee?",
      subtitle: "Meerdere mogelijk, optioneel. Bijvoorbeeld privé, thuis of andere omstandigheden buiten het werk.",
      topic: "Sociale gezondheid",
      tooltip: "Hier kun je aangeven welke dingen naast je werk of binnen je werk het zwaarder maken.",
      optionalNoteField: "factorenToelichting",
      render: (fd, _, toggleMulti) => (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Privé / persoonlijk</h4>
            <CheckboxList options={FACTOREN_PRIVE} selected={fd.factoren} onToggle={(v) => toggleMulti("factoren", v)} />
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Werk & energie</h4>
            <CheckboxList options={FACTOREN_WERK} selected={fd.factoren} onToggle={(v) => toggleMulti("factoren", v)} />
          </div>
        </div>
      ),
    },
    {
      id: "sinds",
      group: "Situatie",
      title: "Sinds wanneer is dit een probleem?",
      topic: "Psychische gezondheid",
      tooltip: "Dit helpt om in te schatten hoe lang de situatie al zwaarder voelt dan normaal.",
      render: (fd, update) => (
        <RadioGroup value={fd.sinds} onValueChange={(v) => update({ sinds: v })} className="space-y-2">
          {SINDS_OPTIONS.map((opt) => (
            <div key={opt.id} className="flex items-center space-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
              <RadioGroupItem value={opt.id} id={`sinds-${opt.id}`} />
              <Label htmlFor={`sinds-${opt.id}`} className="flex-1 cursor-pointer text-sm">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      ),
    },
    {
      id: "risico",
      group: "Situatie",
      title: "Hoe groot is de kans dat dit zonder verandering richting verzuim gaat?",
      topic: "Medische gezondheid",
      tooltip: "Dit gaat over jouw gevoel van risico op uitval, niet om een medische inschatting.",
      render: (fd, update, toggleMulti) => (
        <div className="space-y-6">
          <div>
            <ScaleSlider
              value={fd.risico}
              onChange={(v) => update({ risico: v })}
              labelLeft="Nauwelijks"
              labelMid="Twijfel"
              labelRight="Zeer groot"
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm">Welke signalen herken je bij jezelf op het werk?</Label>
            <p className="mb-3 text-xs text-muted-foreground">
              Meerdere antwoorden zijn mogelijk. Kies wat nu het beste past.
            </p>
            <CheckboxList options={SIGNALEN_OPTIONS} selected={fd.signalen} onToggle={(v) => toggleMulti("signalen", v)} />
          </div>
        </div>
      ),
    },
    {
      id: "signalen-toelichting",
      group: "Situatie",
      title: "Wil je de signalen kort toelichten? (optioneel)",
      subtitle: "Alleen invullen als je dat prettig vindt.",
      topic: "Psychische gezondheid",
      tooltip: "Gebruik dit veld als je in je eigen woorden iets wilt toevoegen over wat je merkt.",
      optionalNoteField: "signalenToelichting",
      render: (fd, update) => (
        <Textarea
          value={fd.signalenToelichting}
          onChange={(e) => update({ signalenToelichting: e.target.value })}
          placeholder="Bijvoorbeeld: ik merk het vooral aan mijn concentratie of hoe ik thuis binnenkom..."
          maxLength={300}
          rows={3}
        />
      ),
    },
    {
      id: "doelen",
      group: "Situatie",
      title: "Wat wil je uit het eerste gesprek halen?",
      subtitle: "Kies maximaal 2.",
      topic: "Psychische gezondheid",
      tooltip: "Dit helpt de time-out coach om het gesprek aan te laten sluiten op jouw behoefte.",
      optionalNoteField: "doelenToelichting",
      render: (fd, update, toggleMulti) => (
        <>
          <ChipSelect options={DOEL_OPTIONS} selected={fd.doelen} onToggle={(v) => toggleMulti("doelen", v, 2)} max={2} />
          {fd.doelen.length >= 2 && (
            <p className="mt-2 text-xs text-muted-foreground">Maximum bereikt. Deselecteer er een om te wisselen.</p>
          )}
        </>
      ),
    },
    {
      id: "belangrijkheid",
      group: "Situatie",
      title: "Hoe belangrijk is dit gesprek voor je op dit moment?",
      topic: "Psychische gezondheid",
      tooltip: "Dit geeft aan hoeveel urgentie jij zelf voelt bij het voeren van dit gesprek.",
      render: (fd, update) => (
        <ScaleSlider value={fd.belangrijkheid} onChange={(v) => update({ belangrijkheid: v })} labelLeft="Handig" labelMid="Belangrijk" labelRight="Noodzakelijk" />
      ),
    },

    // ─── GROUP 2: VERDIEPING ───

    // Route A: Werkdruk
    {
      id: "werkdruk-druk",
      group: "Verdieping",
      title: "Wat geeft je nu de meeste druk?",
      subtitle: "Meerdere opties mogelijk.",
      isVisible: (fd) => fd.hoofdoorzaak === "werkdruk" || fd.hoofdoorzaak === "incident",
      topic: "Psychische gezondheid",
      tooltip: "Hier kun je aangeven waar de druk vooral vandaan komt zonder in details over klachten te gaan.",
      render: (fd, _, toggleMulti) => (
        <CheckboxList options={WERKDRUK_DRUK} selected={fd.werkdrukDruk} onToggle={(v) => toggleMulti("werkdrukDruk", v)} />
      ),
    },
    {
      id: "werkdruk-duur",
      group: "Verdieping",
      title: "Hoe lang speelt dit al?",
      isVisible: (fd) => fd.hoofdoorzaak === "werkdruk" || fd.hoofdoorzaak === "incident",
      topic: "Psychische gezondheid",
      tooltip: "Dit zegt iets over hoe lang je deze druk al zo ervaart.",
      render: (fd, update) => (
        <RadioGroup value={fd.werkdrukDuur} onValueChange={(v) => update({ werkdrukDuur: v })} className="space-y-2">
          {WERKDRUK_DUUR.map((opt) => (
            <div key={opt.id} className="flex items-center space-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
              <RadioGroupItem value={opt.id} id={`wd-${opt.id}`} />
              <Label htmlFor={`wd-${opt.id}`} className="flex-1 cursor-pointer text-sm">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      ),
    },
    {
      id: "werkdruk-geprobeerd",
      group: "Verdieping",
      title: "Wat heb je al geprobeerd?",
      subtitle: "Meerdere opties mogelijk.",
      isVisible: (fd) => fd.hoofdoorzaak === "werkdruk" || fd.hoofdoorzaak === "incident",
      topic: "Sociale gezondheid",
      tooltip: "Hier gaat het om wat jij zelf of samen met anderen al hebt gedaan om het lichter te maken.",
      render: (fd, _, toggleMulti) => (
        <CheckboxList options={WERKDRUK_GEPROBEERD} selected={fd.werkdrukGeprobeerd} onToggle={(v) => toggleMulti("werkdrukGeprobeerd", v)} />
      ),
    },
    {
      id: "werkdruk-helpt",
      group: "Verdieping",
      title: "Wat zou de komende 1-2 weken het meest helpen?",
      isVisible: (fd) => fd.hoofdoorzaak === "werkdruk" || fd.hoofdoorzaak === "incident",
      topic: "Sociale gezondheid",
      tooltip: "Dit helpt om samen te kijken welke praktische steun of ruimte je nu nodig hebt.",
      render: (fd, update) => (
        <>
          <RadioGroup value={fd.werkdrukHelpt} onValueChange={(v) => update({ werkdrukHelpt: v })} className="space-y-2">
            {WERKDRUK_HELPT.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                <RadioGroupItem value={opt.id} id={`wh-${opt.id}`} />
                <Label htmlFor={`wh-${opt.id}`} className="flex-1 cursor-pointer text-sm">{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {fd.werkdrukHelpt === "anders" && (
            <Input className="mt-3" value={fd.werkdrukHelptAnders} onChange={(e) => update({ werkdrukHelptAnders: e.target.value })} placeholder="Wat zou helpen?" maxLength={200} />
          )}
        </>
      ),
    },

    // Route B: Samenwerking
    {
      id: "conflict-met",
      group: "Verdieping",
      title: "Met wie speelt dit vooral?",
      isVisible: (fd) => fd.hoofdoorzaak === "samenwerking",
      topic: "Sociale gezondheid",
      tooltip: "Hier gaat het om met wie de spanning of frictie vooral te maken heeft.",
      render: (fd, update) => (
        <RadioGroup value={fd.conflictMet} onValueChange={(v) => update({ conflictMet: v })} className="space-y-2">
          {CONFLICT_MET.map((opt) => (
            <div key={opt.id} className="flex items-center space-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
              <RadioGroupItem value={opt.id} id={`cm-${opt.id}`} />
              <Label htmlFor={`cm-${opt.id}`} className="flex-1 cursor-pointer text-sm">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      ),
    },
    {
      id: "conflict-waarover",
      group: "Verdieping",
      title: "Waar gaat het vooral over?",
      subtitle: "Meerdere opties mogelijk.",
      isVisible: (fd) => fd.hoofdoorzaak === "samenwerking",
      topic: "Sociale gezondheid",
      tooltip: "Kies waar het conflict of de spanning vooral over gaat, zonder in vertrouwelijke details te treden.",
      render: (fd, _, toggleMulti) => (
        <CheckboxList options={CONFLICT_WAAROVER} selected={fd.conflictWaarover} onToggle={(v) => toggleMulti("conflictWaarover", v)} />
      ),
    },
    {
      id: "conflict-veilig",
      group: "Verdieping",
      title: "Hoe veilig voelt het om dit intern te bespreken?",
      isVisible: (fd) => fd.hoofdoorzaak === "samenwerking",
      topic: "Psychische gezondheid",
      tooltip: "Dit gaat over jouw gevoel van veiligheid om dit binnen de organisatie te bespreken.",
      render: (fd, update) => (
        <ScaleSlider value={fd.conflictVeilig} onChange={(v) => update({ conflictVeilig: v })} labelLeft="Onveilig" labelMid="Neutraal" labelRight="Veilig" />
      ),
    },
    {
      id: "conflict-contact",
      group: "Verdieping",
      title: "Mag er contact zijn met je leidinggevende hierover?",
      isVisible: (fd) => fd.hoofdoorzaak === "samenwerking",
      topic: "Sociale gezondheid",
      tooltip: "Hier geef je aan wat voor jou op dit moment prettig en veilig voelt richting je leidinggevende.",
      render: (fd, update) => (
        <RadioGroup value={fd.conflictContact} onValueChange={(v) => update({ conflictContact: v })} className="space-y-2">
          {[{ id: "ja", label: "Ja" }, { id: "nee", label: "Nee" }, { id: "weet-niet", label: "Weet ik nog niet" }].map((opt) => (
            <div key={opt.id} className="flex items-center space-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
              <RadioGroupItem value={opt.id} id={`cc-${opt.id}`} />
              <Label htmlFor={`cc-${opt.id}`} className="flex-1 cursor-pointer text-sm">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      ),
    },
    {
      id: "conflict-uitkomst",
      group: "Verdieping",
      title: "Gewenste uitkomst van het gesprek",
      isVisible: (fd) => fd.hoofdoorzaak === "samenwerking",
      topic: "Psychische gezondheid",
      tooltip: "Wat hoop je dat het gesprek oplevert rondom de samenwerking of het conflict?",
      render: (fd, update) => (
        <RadioGroup value={fd.conflictUitkomst} onValueChange={(v) => update({ conflictUitkomst: v })} className="space-y-2">
          {CONFLICT_UITKOMST.map((opt) => (
            <div key={opt.id} className="flex items-center space-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
              <RadioGroupItem value={opt.id} id={`cu-${opt.id}`} />
              <Label htmlFor={`cu-${opt.id}`} className="flex-1 cursor-pointer text-sm">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      ),
    },

    // Route C: Privé
    {
      id: "prive-waarover",
      group: "Verdieping",
      title: "Waar gaat het vooral over?",
      subtitle: "Meerdere opties mogelijk.",
      isVisible: (fd) => fd.hoofdoorzaak === "prive",
      topic: "Sociale gezondheid",
      tooltip: "Hier kun je in grote lijnen aangeven welke privésituatie meespeelt, zonder details te hoeven delen.",
      render: (fd, _, toggleMulti) => (
        <CheckboxList options={PRIVE_WAAROVER} selected={fd.priveWaarover} onToggle={(v) => toggleMulti("priveWaarover", v)} />
      ),
    },
    {
      id: "prive-delen",
      group: "Verdieping",
      title: "Wil je vooraf al iets delen?",
      isVisible: (fd) => fd.hoofdoorzaak === "prive",
      topic: "Sociale gezondheid",
      tooltip: "Je kiest zelf of je nu al iets kort wilt delen of liever wacht tot het gesprek.",
      render: (fd, update) => (
        <>
          <RadioGroup value={fd.priveDelen} onValueChange={(v) => update({ priveDelen: v })} className="space-y-2">
            {[{ id: "ja", label: "Ja, kort" }, { id: "gesprek", label: "Liever tijdens het gesprek" }, { id: "niet", label: "Liever niet" }].map((opt) => (
              <div key={opt.id} className="flex items-center space-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                <RadioGroupItem value={opt.id} id={`pd-${opt.id}`} />
                <Label htmlFor={`pd-${opt.id}`} className="flex-1 cursor-pointer text-sm">{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {fd.priveDelen === "ja" && (
            <Textarea className="mt-3" value={fd.priveDelenText} onChange={(e) => update({ priveDelenText: e.target.value })} placeholder="Vertel kort wat je wilt delen..." maxLength={300} rows={3} />
          )}
        </>
      ),
    },
    {
      id: "prive-nodig",
      group: "Verdieping",
      title: "Wat heb je vanuit werk het meest nodig?",
      subtitle: "Meerdere opties mogelijk.",
      isVisible: (fd) => fd.hoofdoorzaak === "prive",
      topic: "Sociale gezondheid",
      tooltip: "Dit gaat om praktische steun of ruimte die je vanuit werk kan helpen.",
      render: (fd, _, toggleMulti) => (
        <CheckboxList options={PRIVE_NODIG} selected={fd.priveNodig} onToggle={(v) => toggleMulti("priveNodig", v)} />
      ),
    },
    // Privé sub-questions
    {
      id: "mantelzorg",
      group: "Verdieping",
      title: "Mantelzorg - extra vragen",
      subtitle: "Omdat je mantelzorg hebt aangevinkt.",
      isVisible: (fd) => fd.hoofdoorzaak === "prive" && fd.priveWaarover.includes("Mantelzorg"),
      topic: "Sociale gezondheid",
      tooltip: "Hier kun je kort aangeven hoe mantelzorg jouw belasting beïnvloedt, zonder medische gegevens te delen.",
      render: (fd, update) => (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">Voor wie zorg je?</Label>
            <Input value={fd.mantelzorgVoor} onChange={(e) => update({ mantelzorgVoor: e.target.value })} placeholder="Bijv. ouder, partner, kind..." maxLength={100} />
          </div>
          <div>
            <Label className="mb-2 block text-sm">Hoe zwaar is dit?</Label>
            <ScaleSlider value={fd.mantelzorgZwaar} onChange={(v) => update({ mantelzorgZwaar: v })} labelLeft="Licht" labelMid="Gemiddeld" labelRight="Zeer zwaar" />
          </div>
          <div>
            <Label className="mb-2 block text-sm">Wat knelt het meest?</Label>
            <Input value={fd.mantelzorgKnelt} onChange={(e) => update({ mantelzorgKnelt: e.target.value })} placeholder="Bijv. combinatie met werk, emotioneel..." maxLength={200} />
          </div>
        </div>
      ),
    },
    {
      id: "relatie",
      group: "Verdieping",
      title: "Relatie / thuis - extra vragen",
      subtitle: "Omdat je relatie/thuissituatie hebt aangevinkt.",
      isVisible: (fd) => fd.hoofdoorzaak === "prive" && fd.priveWaarover.includes("Relatie / thuissituatie"),
      topic: "Sociale gezondheid",
      tooltip: "Hier kun je in je eigen woorden kort beschrijven wat er thuis speelt en waar je het meest last van hebt.",
      render: (fd, update) => (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">Wat past het best?</Label>
            <Input value={fd.relatieWat} onChange={(e) => update({ relatieWat: e.target.value })} placeholder="Kort omschrijven..." maxLength={200} />
          </div>
          <div>
            <Label className="mb-2 block text-sm">Waar merk je dit vooral in?</Label>
            <Input value={fd.relatieMerkt} onChange={(e) => update({ relatieMerkt: e.target.value })} placeholder="Bijv. concentratie, slaap, stemming..." maxLength={200} />
          </div>
        </div>
      ),
    },
    {
      id: "kinderen",
      group: "Verdieping",
      title: "Kinderen / gezin - extra vragen",
      subtitle: "Omdat je kinderen/gezin hebt aangevinkt.",
      isVisible: (fd) => fd.hoofdoorzaak === "prive" && fd.priveWaarover.includes("Kinderen / gezin"),
      topic: "Sociale gezondheid",
      tooltip: "Hier gaat het om wat er in je gezin speelt dat invloed heeft op je energie en werk.",
      render: (fd, update) => (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">Wat speelt vooral?</Label>
            <Input value={fd.kinderenWat} onChange={(e) => update({ kinderenWat: e.target.value })} placeholder="Kort omschrijven..." maxLength={200} />
          </div>
          <div>
            <Label className="mb-2 block text-sm">Grootste knelpunt richting verzuim?</Label>
            <Input value={fd.kinderenKnelpunt} onChange={(e) => update({ kinderenKnelpunt: e.target.value })} placeholder="Bijv. tijd, energie, stress..." maxLength={200} />
          </div>
        </div>
      ),
    },

    // Route D: Energie
    {
      id: "energie-merkt",
      group: "Verdieping",
      title: "Wat merk je vooral?",
      subtitle: "Meerdere opties mogelijk.",
      isVisible: (fd) => fd.hoofdoorzaak === "energie",
      topic: "Medische gezondheid",
      tooltip: "Kies wat je vooral merkt in je energie en lijf, zonder dat het om een diagnose gaat.",
      render: (fd, _, toggleMulti) => (
        <CheckboxList options={ENERGIE_MERKT} selected={fd.energieMerkt} onToggle={(v) => toggleMulti("energieMerkt", v)} />
      ),
    },
    {
      id: "energie-zorg",
      group: "Verdieping",
      title: "Wat is je grootste zorg als dit zo doorgaat?",
      subtitle: "Meerdere opties mogelijk.",
      isVisible: (fd) => fd.hoofdoorzaak === "energie",
      topic: "Psychische gezondheid",
      tooltip: "Dit gaat over jouw zorgen als de situatie niet verandert, zowel privé als op het werk.",
      render: (fd, _, toggleMulti) => (
        <CheckboxList
          options={["Uitval / verzuim", "Relatie onder druk", "Niet meer kunnen functioneren", "Geen energie meer voor priv\u00e9", "Fouten op het werk"]}
          selected={fd.energieZorg}
          onToggle={(v) => toggleMulti("energieZorg", v)}
        />
      ),
    },
    {
      id: "energie-hulp",
      group: "Verdieping",
      title: "Is er al professionele hulp gezocht?",
      isVisible: (fd) => fd.hoofdoorzaak === "energie",
      topic: "Medische gezondheid",
      tooltip: "Hier kun je aangeven of je al ergens ondersteuning hebt gezocht, zonder inhoudelijke details.",
      render: (fd, update) => (
        <RadioGroup value={fd.energieHulp} onValueChange={(v) => update({ energieHulp: v })} className="space-y-2">
          {[{ id: "ja", label: "Ja" }, { id: "nee", label: "Nee" }, { id: "liever-niet", label: "Liever niet zeggen" }].map((opt) => (
            <div key={opt.id} className="flex items-center space-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
              <RadioGroupItem value={opt.id} id={`eh-${opt.id}`} />
              <Label htmlFor={`eh-${opt.id}`} className="flex-1 cursor-pointer text-sm">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      ),
    },

    // Route E: Combinatie
    {
      id: "combinatie-verdeling",
      group: "Verdieping",
      title: "Hoe verdeelt de belasting zich?",
      subtitle: "Schuif de verdeling tussen werk en priv\u00e9.",
      isVisible: (fd) => fd.hoofdoorzaak === "combinatie",
      topic: "Sociale gezondheid",
      tooltip: "Hier geef je in grote lijnen aan hoeveel van de belasting uit werk en hoeveel uit privé komt.",
      render: (fd, update) => (
        <div>
          <Slider value={[fd.combinatieVerdeling]} onValueChange={([v]) => update({ combinatieVerdeling: v })} min={0} max={100} step={5} className="w-full" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Werk {fd.combinatieVerdeling}%</span>
            <span>Priv\u00e9 {100 - fd.combinatieVerdeling}%</span>
          </div>
        </div>
      ),
    },
    {
      id: "combinatie-verandering",
      group: "Verdieping",
      title: "Wat zou een eerste kleine verandering zijn die direct lucht geeft?",
      isVisible: (fd) => fd.hoofdoorzaak === "combinatie",
      topic: "Psychische gezondheid",
      tooltip: "Denk aan een kleine stap die de druk direct iets kan verlagen, thuis of op het werk.",
      render: (fd, update) => (
        <Input value={fd.combinatieVerandering} onChange={(e) => update({ combinatieVerandering: e.target.value })} placeholder="Optioneel - kort omschrijven..." maxLength={200} />
      ),
    },

    // Anders fallback
    {
      id: "anders-info",
      group: "Verdieping",
      title: "Je hebt 'Anders' gekozen",
      isVisible: (fd) => fd.hoofdoorzaak === "anders",
      topic: "Psychische gezondheid",
      tooltip: "Hier hoef je niets in te vullen; dit is alleen een korte uitleg bij je keuze voor 'Anders'.",
      render: () => (
        <div className="rounded-xl border border-border bg-secondary/20 p-5">
          <p className="text-sm text-muted-foreground">
            In het gesprek met je time-out coach kun je hier dieper op ingaan. Ga verder naar de volgende vraag.
          </p>
        </div>
      ),
    },

    // Closing (all routes)
    {
      id: "closing-nodig",
      group: "Verdieping",
      title: "Wat kunnen we nu doen om te voorkomen dat dit richting verzuim gaat?",
      subtitle: "Meerdere opties mogelijk.",
      topic: "Sociale gezondheid",
      tooltip: "Dit gaat om wat jou kan helpen om uitval te voorkomen, vooral in afspraken en ondersteuning.",
      optionalNoteField: "closingToelichting",
      render: (fd, _, toggleMulti) => (
        <CheckboxList options={CLOSING_OPTIONS} selected={fd.closingNodig} onToggle={(v) => toggleMulti("closingNodig", v)} />
      ),
    },
    {
      id: "closing-belangrijk",
      group: "Verdieping",
      title: "Hoe belangrijk is dat voor je?",
      topic: "Psychische gezondheid",
      tooltip: "Dit geeft aan hoeveel gewicht je zelf aan deze afspraken of steun hecht.",
      render: (fd, update) => (
        <>
          <ScaleSlider value={fd.closingBelangrijk} onChange={(v) => update({ closingBelangrijk: v })} labelLeft="Handig" labelMid="Belangrijk" labelRight="Noodzakelijk" />
          <p className="mt-3 text-xs text-muted-foreground italic">
            We vragen dit zodat dit een concreet onderwerp wordt in het Time-out gesprek.
          </p>
        </>
      ),
    },

    // ─── GROUP 3: RANDVOORWAARDEN ───
    {
      id: "rand-wel",
      group: "Randvoorwaarden",
      title: "Wat wil je absoluut wel bereiken met deze time-out?",
      topic: "Psychische gezondheid",
      tooltip: "Hier kun je beschrijven wat jij hoopt dat dit traject jou oplevert.",
      render: (fd, update) => (
        <>
          <Textarea value={fd.randWelBereiken} onChange={(e) => update({ randWelBereiken: e.target.value })} placeholder="Bijv. rust en overzicht, duidelijke afspraken..." maxLength={200} rows={3} />
          <p className="mt-1 text-xs text-muted-foreground">{fd.randWelBereiken.length}/200</p>
        </>
      ),
    },
    {
      id: "rand-niet",
      group: "Randvoorwaarden",
      title: "Wat wil je absoluut niet dat dit gesprek wordt?",
      topic: "Sociale gezondheid",
      tooltip: "Hier kun je aangeven wat je liever niet wilt dat er gebeurt in of rond het gesprek.",
      render: (fd, update) => (
        <>
          <Textarea value={fd.randNietBereiken} onChange={(e) => update({ randNietBereiken: e.target.value })} placeholder="Bijv. geen beoordelingsgesprek, geen diagnose..." maxLength={200} rows={3} />
          <p className="mt-1 text-xs text-muted-foreground">{fd.randNietBereiken.length}/200</p>
        </>
      ),
    },
    {
      id: "terugkoppeling",
      group: "Randvoorwaarden",
      title: "Mag er terugkoppeling richting je werkgever plaatsvinden?",
      topic: "Sociale gezondheid",
      tooltip: "Je bepaalt zelf wat er wel of niet naar je werkgever teruggekoppeld mag worden.",
      render: (fd, update) => (
        <>
          <RadioGroup value={fd.terugkoppeling} onValueChange={(v) => update({ terugkoppeling: v })} className="space-y-2">
            {TERUGKOPPELING_OPTIONS.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                <RadioGroupItem value={opt.id} id={`tk-${opt.id}`} />
                <Label htmlFor={`tk-${opt.id}`} className="flex-1 cursor-pointer text-sm">{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
          <p className="mt-3 text-xs text-muted-foreground italic">
            Er gaat geen terugkoppeling richting de werkgever zonder jouw expliciete toestemming.
          </p>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-all hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
            <Checkbox checked={fd.terugkoppelingAkkoord} onCheckedChange={(c) => update({ terugkoppelingAkkoord: c === true })} className="mt-0.5" />
            <span className="text-sm text-muted-foreground">Ik begrijp dat deze voorwaarden leidend zijn voor het gesprek</span>
          </label>
        </>
      ),
    },
  ]
}

// ── Mock summary ──
function generateSummary(fd: FormData): string {
  const oorzaakLabel = HOOFDOORZAAK_OPTIONS.find(o => o.id === fd.hoofdoorzaak)?.label || fd.andersText || "onbekend"
  const sindsLabel = SINDS_OPTIONS.find(o => o.id === fd.sinds)?.label || "onbekend"

  let summary = `## Wat speelt er\nDe hoofdoorzaak van deze time-out aanvraag is **${oorzaakLabel.toLowerCase()}**. Dit speelt al **${sindsLabel.toLowerCase()}**.`
  if (fd.factoren.length > 0) summary += ` Daarnaast spelen er factoren als ${fd.factoren.join(", ").toLowerCase()}.`

  summary += `\n\n## Signalen\n`
  summary += fd.signalen.length > 0 ? `Op het werk zijn de volgende signalen merkbaar: ${fd.signalen.join(", ").toLowerCase()}.` : `Er zijn geen specifieke signalen op het werk aangegeven.`

  summary += `\n\n## Inschatting risico\nDe zwaarte wordt ingeschat op **${fd.zwaarte} van 7**. De kans op verzuim zonder verandering is ingeschat op **${fd.risico} van 7**.`

  summary += `\n\n## Verdieping\n`
  if (fd.hoofdoorzaak === "werkdruk" || fd.hoofdoorzaak === "incident") {
    if (fd.werkdrukDruk.length > 0) summary += `De druk komt vooral door ${fd.werkdrukDruk.join(", ").toLowerCase()}.`
    if (fd.werkdrukGeprobeerd.length > 0) summary += ` Al geprobeerd: ${fd.werkdrukGeprobeerd.join(", ").toLowerCase()}.`
  } else if (fd.hoofdoorzaak === "samenwerking") {
    const metLabel = CONFLICT_MET.find(o => o.id === fd.conflictMet)?.label || ""
    if (metLabel) summary += `Dit speelt vooral met: ${metLabel.toLowerCase()}.`
    if (fd.conflictWaarover.length > 0) summary += ` Het gaat over: ${fd.conflictWaarover.join(", ").toLowerCase()}.`
  } else if (fd.hoofdoorzaak === "prive") {
    if (fd.priveWaarover.length > 0) summary += `Het gaat over: ${fd.priveWaarover.join(", ").toLowerCase()}.`
    if (fd.priveNodig.length > 0) summary += ` Vanuit werk is nodig: ${fd.priveNodig.join(", ").toLowerCase()}.`
  } else if (fd.hoofdoorzaak === "energie") {
    if (fd.energieMerkt.length > 0) summary += `Merkbaar: ${fd.energieMerkt.join(", ").toLowerCase()}.`
  } else if (fd.hoofdoorzaak === "combinatie") {
    summary += `Belasting: ${fd.combinatieVerdeling}% werk, ${100 - fd.combinatieVerdeling}% priv\u00e9.`
  }

  summary += `\n\n## Doelen\n`
  if (fd.doelen.length > 0) summary += fd.doelen.map(d => `- ${d}`).join("\n")
  summary += `\nBelangrijkheid: **${fd.belangrijkheid} van 7**.`

  summary += `\n\n## Randvoorwaarden\n`
  if (fd.randWelBereiken) summary += `Wil bereiken: "${fd.randWelBereiken}". `
  if (fd.randNietBereiken) summary += `Wil niet: "${fd.randNietBereiken}". `
  const tkLabel = TERUGKOPPELING_OPTIONS.find(o => o.id === fd.terugkoppeling)?.label || "niet ingevuld"
  summary += `\nTerugkoppeling werkgever: ${tkLabel.toLowerCase()}.`

  return summary
}

// ── Main component ──

const GROUP_LABELS = ["Situatie", "Verdieping", "Randvoorwaarden", "Samenvatting"]

export default function TimeoutFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isGenerating, setIsGenerating] = useState(false)
  const [summaryText, setSummaryText] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { role, route } = getDemoContext()
    if (!role || route !== "timeout") {
      router.push("/demo")
    }
  }, [router])

  // Load saved form state from sessionStorage once
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.sessionStorage.getItem("timeoutFormV2")
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FormData
        setFormData((prev) => ({ ...prev, ...parsed }))
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  // Persist form state for refresh-safety
  useEffect(() => {
    if (typeof window === "undefined") return
    window.sessionStorage.setItem("timeoutFormV2", JSON.stringify(formData))
  }, [formData])

  const allScreens = buildScreens()
  const visibleScreens = allScreens.filter((s) => !s.isVisible || s.isVisible(formData))

  const stepFromUrl = searchParams.get("stap") || visibleScreens[0]?.id
  const isSummaryStep = stepFromUrl === "samenvatting"

  const currentScreenIndex = isSummaryStep
    ? visibleScreens.length - 1
    : Math.max(
        0,
        visibleScreens.findIndex((s) => s.id === stepFromUrl) === -1
          ? 0
          : visibleScreens.findIndex((s) => s.id === stepFromUrl),
      )

  const currentScreen = isSummaryStep ? null : visibleScreens[currentScreenIndex]
  const totalVisible = visibleScreens.length

  // Overall progress including samenvatting
  const totalStepsWithSummary = totalVisible + 1
  const currentStepNumber = isSummaryStep ? totalVisible + 1 : currentScreenIndex + 1
  const overallPercent = Math.round((currentStepNumber / totalStepsWithSummary) * 100)

  // Figure out which group we're in for progress bar
  const currentGroup = currentScreen?.group || "Samenvatting"
  const groupIndex = GROUP_LABELS.indexOf(isSummaryStep ? "Samenvatting" : currentGroup)

  const update = useCallback((partial: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }))
  }, [])

  const toggleMulti = useCallback((field: keyof FormData, value: string, max?: number) => {
    setFormData((prev) => {
      const current = prev[field] as string[]
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) }
      }
      if (max && current.length >= max) return prev
      return { ...prev, [field]: [...current, value] }
    })
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNext = async () => {
    if (isSummaryStep) return

    const currentIndex = currentScreenIndex

    if (currentIndex < totalVisible - 1) {
      const nextId = visibleScreens[currentIndex + 1].id
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      params.set("stap", nextId)
      router.push(`/timeout/run/demo/form?${params.toString()}`)
      scrollToTop()
    } else {
      // Last question screen -> go to summary step
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      params.set("stap", "samenvatting")
      router.push(`/timeout/run/demo/form?${params.toString()}`)
      scrollToTop()

      // Trigger summary generation
      setIsGenerating(true)
      try {
        const res = await fetch("/api/timeout/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData }),
        })
        const data = await res.json()
        setSummaryText(data.summary)
      } catch {
        // Fallback to mock if API fails
        setSummaryText(generateSummary(formData))
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const handleBack = () => {
    if (isSummaryStep) {
      // Back from summary to last visible vraag
      const lastId = visibleScreens[visibleScreens.length - 1]?.id
      if (lastId) {
        const params = new URLSearchParams(Array.from(searchParams.entries()))
        params.set("stap", lastId)
        router.push(`/timeout/run/demo/form?${params.toString()}`)
        scrollToTop()
      }
      return
    }

    const currentIndex = currentScreenIndex
    if (currentIndex > 0) {
      const prevId = visibleScreens[currentIndex - 1].id
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      params.set("stap", prevId)
      router.push(`/timeout/run/demo/form?${params.toString()}`)
      scrollToTop()
    }
  }

  const handleConfirmSend = () => {
    setShowConfirmModal(false)
    setIsSubmitted(true)
  }

  // Progress within current group
  const screensInCurrentGroup = visibleScreens.filter(s => s.group === currentGroup)
  const indexInGroup = screensInCurrentGroup.findIndex(s => s.id === currentScreen?.id)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader showBack backHref="/timeout/start/demo" />

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Top progress bar - groups */}
          {!isSubmitted && (
            <div className="mb-8">
              {/* Overall progress based on actieve vragen + samenvatting */}
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Stap {currentStepNumber} van {totalStepsWithSummary}
                  </span>
                  <span>{overallPercent}% voltooid</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
              </div>

              <div className="mb-3 flex justify-between">
                {GROUP_LABELS.map((label, i) => {
                  const isActive = i === groupIndex
                  const isDone = i < groupIndex
                  return (
                    <div key={label} className="flex flex-1 flex-col items-center gap-1">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${isDone ? "bg-primary text-primary-foreground" : isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {isDone ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`text-center text-xs ${isActive || isDone ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-1">
                {GROUP_LABELS.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= groupIndex ? "bg-primary" : "bg-secondary"}`} />
                ))}
              </div>

              {/* Sub-progress within group */}
              {!isSummaryStep && screensInCurrentGroup.length > 1 && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Vraag {indexInGroup + 1} van {screensInCurrentGroup.length}
                  </span>
                  <div className="flex gap-1">
                    {screensInCurrentGroup.map((_, i) => (
                      <div key={i} className={`h-1 w-4 rounded-full transition-colors ${i <= indexInGroup ? "bg-primary/60" : "bg-secondary"}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Summary step ── */}
          {isSummaryStep ? (
            <>
              {isGenerating ? (
                <Card className="rounded-2xl">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-primary" />
                    <h2 className="mb-2 text-xl font-semibold text-foreground">We maken je samenvatting...</h2>
                    <p className="text-center text-muted-foreground">Even geduld, we verwerken je antwoorden.</p>
                    <div className="mt-8 w-full space-y-3">
                      <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                      <div className="h-4 w-11/12 animate-pulse rounded bg-secondary" />
                      <div className="h-4 w-10/12 animate-pulse rounded bg-secondary" />
                      <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                      <div className="h-4 w-9/12 animate-pulse rounded bg-secondary" />
                    </div>
                  </CardContent>
                </Card>
              ) : isSubmitted ? (
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="mb-2 text-2xl font-semibold text-foreground">Je samenvatting is gedeeld.</h2>
                  <p className="mb-8 text-muted-foreground">De voorbereiding is afgerond.</p>
                  <Button variant="outline" onClick={() => router.push("/dashboard/employee?flow=timeout")} className="rounded-xl bg-transparent">
                    Terug naar dashboard
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-center">
                    <h2 className="mb-1 text-xl font-semibold text-foreground">Samenvatting voor het gesprek</h2>
                    <p className="text-sm text-muted-foreground">Lees rustig. Jij bepaalt of dit klopt.</p>
                  </div>

                  <Card className="mb-4 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="prose prose-sm max-w-none">
                        {summaryText.split("\n").map((line, i) => {
                          if (line.startsWith("## ")) return <h3 key={i} className="mb-2 mt-4 text-base font-semibold text-primary first:mt-0">{line.replace("## ", "")}</h3>
                          if (line.startsWith("- ")) return <p key={i} className="mb-1 pl-4 text-sm text-foreground">&#8226; {line.replace("- ", "")}</p>
                          if (line.trim() === "") return <div key={i} className="h-2" />
                          const parts = line.split(/(\*\*.*?\*\*)/)
                          return (
                            <p key={i} className="mb-2 text-sm leading-relaxed text-foreground">
                              {parts.map((part, j) => part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part)}
                            </p>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mb-6 rounded-2xl border-accent/30 bg-accent/5">
                    <CardContent className="p-4">
                      <p className="text-center text-sm font-medium text-foreground">
                        Is deze samenvatting juist en volledig genoeg voor het gesprek?
                      </p>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button variant="outline" onClick={handleBack} className="rounded-xl bg-transparent">
                      Nee, ik wil aanpassen
                    </Button>
                    <Button onClick={() => setShowConfirmModal(true)} className="rounded-xl">
                      <Send className="mr-2 h-4 w-4" />
                      Ja, dit klopt - delen met time-out coach
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* ── Question screen ── */}
              <Card ref={cardRef} className="rounded-2xl">
                <CardContent className="p-6">
                  {currentScreen && (
                    <>
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h2 className="mb-1 text-xl font-semibold text-foreground">{currentScreen.title}</h2>
                          {currentScreen.subtitle && (
                            <p className="text-sm text-muted-foreground">{currentScreen.subtitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                            {currentScreen.topic}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-muted"
                                aria-label="Uitleg bij deze vraag"
                              >
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>{currentScreen.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="mt-4 space-y-6">
                        {currentScreen.render(formData, update, toggleMulti)}
                        {currentScreen.optionalNoteField && (
                          <div className="pt-2">
                            <Label className="mb-1 block text-sm">
                              Wil je dit kort toelichten? (optioneel)
                            </Label>
                            <Textarea
                              value={formData[currentScreen.optionalNoteField] as string}
                              onChange={(e) =>
                                update({ [currentScreen.optionalNoteField]: e.target.value } as Partial<FormData>)
                              }
                              placeholder="In je eigen woorden, zo kort als jij wilt."
                              rows={3}
                              maxLength={400}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={screenIndex === 0}
                  className="rounded-xl bg-transparent"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Vorige
                </Button>
                <Button onClick={handleNext} className="rounded-xl">
                  {screenIndex === totalVisible - 1 ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Maak samenvatting
                    </>
                  ) : (
                    <>
                      Volgende
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <AppFooter />

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription className="space-y-3">
              <p>Alleen deze samenvatting wordt gedeeld met je time-out coach.</p>
              <p className="font-medium text-foreground">Klopt dit verhaal zoals jij het bedoelt?</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="rounded-xl bg-transparent">
              Nog even checken
            </Button>
            <Button onClick={handleConfirmSend} className="rounded-xl">
              <Send className="mr-2 h-4 w-4" />
              Ja, versturen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
