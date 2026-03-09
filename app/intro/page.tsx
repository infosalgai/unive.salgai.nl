"use client";

import Link from "next/link";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import {
  Shield,
  UserX,
  Clock,
  Target,
  Leaf,
  BarChart3,
  MessageSquare,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const fadeIn = "animate-in fade-in-0 duration-500 fill-mode-both";
const stagger = (i: number) => ({ animationDelay: `${i * 100}ms` } as React.CSSProperties);

export default function IntroPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background px-4 py-4">
        <div className="mx-auto max-w-[900px]">
          <UniveLogo height={72} />
        </div>
      </header>

      <main className="mx-auto flex-1 px-4 py-8 max-w-[900px]">
        <div className="mx-auto max-w-xl space-y-8">
          {/* Hero met duidelijk doel */}
          <div className={`space-y-4 ${fadeIn}`} style={stagger(0)}>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-6 w-6" aria-hidden />
              <span className="text-sm font-medium uppercase tracking-wide">Univé &amp; melkveehouderij</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground leading-tight sm:text-3xl">
              Toekomstbestendige melkveehouderij – jouw inzicht telt
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              We willen begrijpen hoe jij je bedrijf ervaart en wat je nodig hebt. Met je antwoorden kunnen we
              ondersteuning ontwikkelen die in de praktijk werkt en rendabel is.
            </p>
          </div>

          {/* Doel van de vragenlijst – heel helder */}
          <section className={`rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 ${fadeIn}`} style={stagger(1)}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
              <Target className="h-5 w-5 text-primary shrink-0" aria-hidden />
              Doel van deze vragenlijst
            </h2>
            <ul className="space-y-3 text-muted-foreground leading-relaxed" role="list">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span><strong className="text-foreground">Inzicht in jouw praktijk</strong> – hoe jij je bedrijf ervaart, wat er speelt en waar je tegenaan loopt.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span><strong className="text-foreground">Betere ondersteuning</strong> – op basis van jouw input willen we concrete ondersteuning ontwikkelen: meer zekerheid, risicobeperking en haalbaarheid op het erf.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span><strong className="text-foreground">Geen goed of fout</strong> – het gaat om jouw werkelijkheid. Je antwoorden helpen ons om beter aan te sluiten bij wat melkveehouders nodig hebben.</span>
              </li>
            </ul>
          </section>

          {/* Waarom we dit doen – compact met iconen */}
          <section className={`space-y-4 ${fadeIn}`} style={stagger(2)}>
            <h2 className="text-lg font-semibold text-foreground">Waarom we dit doen</h2>
            <ul className="space-y-3 text-muted-foreground leading-relaxed" role="list">
              <li className="flex gap-3">
                <Leaf className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden />
                <span>Klimaatverandering, milieueisen en biodiversiteit hebben steeds meer invloed op bedrijfsrisico&apos;s en toekomstbestendigheid. Univé wil bijdragen aan klimaatmitigatie, -adaptatie en biodiversiteit.</span>
              </li>
              <li className="flex gap-3">
                <BarChart3 className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden />
                <span>Deze ontwikkelingen raken direct aan risico&apos;s, verzekerbaarheid en economische continuïteit. We willen melkveehouders ondersteunen bij een toekomstbestendige én rendabele bedrijfsvoering.</span>
              </li>
              <li className="flex gap-3">
                <MessageSquare className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden />
                <span>Verandering werkt alleen als het past bij de praktijk. Daarom willen we van je horen wat er speelt – via deze vragenlijst.</span>
              </li>
            </ul>
          </section>

          {/* Praktische info – icoonkaartjes met lichte animatie */}
          <p className={`text-sm text-muted-foreground ${fadeIn}`} style={stagger(3)}>
            Je gegevens worden anoniem verwerkt. Je bent <strong className="text-foreground">niet verplicht</strong> om contactgegevens (naam, e-mail, telefoon) achter te laten: we vragen ze alleen als je aan het eind aangeeft dat Univé contact met je mag opnemen. Meer hierover vind je in ons{" "}
            <a href="https://www.unive.nl/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded">privacybeleid</a>.
          </p>

          <div
            className={`flex flex-wrap gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 transition-transform hover:border-primary/30 ${fadeIn}`}
            style={stagger(4)}
          >
            <div className="flex items-center gap-2 text-sm text-foreground">
              <UserX className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span>Anoniem</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Shield className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span>Contactgegevens alleen als je toestemming geeft</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Clock className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span>± 10–15 minuten</span>
            </div>
          </div>

          <div className={`pt-4 ${fadeIn}`} style={stagger(5)}>
            <Link href="/vragenlijst" className="block">
              <Button size="lg" className="w-full rounded-xl group">
                Start vragenlijst
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
