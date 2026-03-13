"use client";

import Link from "next/link";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Target,
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
            <h1 className="text-2xl font-semibold text-foreground leading-tight sm:text-3xl">
              Toekomstbestendige melkveehouderij: jouw mening telt
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Als Univé willen we beter begrijpen hoe melkveehouders hun bedrijf vandaag ervaren: financieel, in het dagelijkse werk en richting de toekomst.
            </p>
          </div>

          {/* Doel van de vragenlijst – heel helder */}
          <section className={`rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 ${fadeIn}`} style={stagger(1)}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
              <Target className="h-5 w-5 text-primary shrink-0" aria-hidden />
              Doel van deze vragenlijst
            </h2>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              <p>Door deze vragenlijst krijgen we een eerlijk en realistisch beeld van wat er op uw erf speelt.</p>
              <p>Die inzichten gebruiken we om onze ondersteuning in de duurzaamheidstransitie beter te laten aansluiten bij de praktijk.</p>
              <p>Er zijn geen goede of foute antwoorden; uw eigen ervaring staat centraal.</p>
            </div>
          </section>

          {/* Praktische info – icoonkaartjes met lichte animatie */}
          <p className={`text-sm text-muted-foreground ${fadeIn}`} style={stagger(2)}>
            Je bent <strong className="text-foreground">niet verplicht</strong> om contactgegevens (naam, e-mail, telefoon) achter te laten: we vragen ze alleen als je aan het eind aangeeft dat Univé contact met je mag opnemen. Meer hierover vind je in ons{" "}
            <a href="https://www.unive.nl/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded">privacybeleid</a>.
          </p>

          <div
            className={`flex flex-wrap gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 transition-transform hover:border-primary/30 ${fadeIn}`}
            style={stagger(3)}
          >
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Clock className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span>De vragenlijst zal 10–15 minuten in beslag nemen</span>
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
