"use client";

import Link from "next/link";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import { Shield, UserX, Clock } from "lucide-react";

export default function IntroPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto max-w-[900px]">
          <UniveLogo height={44} />
        </div>
      </header>

      <main className="mx-auto flex-1 px-4 py-8 max-w-[900px]">
        <div className="mx-auto max-w-xl space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Welkom bij de vragenlijst
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Als coöperatieve verzekeraar zien wij dat klimaatverandering, strengere milieueisen en
              biodiversiteitsvraagstukken steeds meer invloed hebben op bedrijfsrisico's én op de
              toekomstbestendigheid van agrarische ondernemingen. Daarom hebben wij als organisatie de
              ambitie om actief bij te dragen aan klimaatmitigatie (CO₂-reductie), klimaatadaptatie en het
              versterken van biodiversiteit. Niet vanuit beleid alleen, maar ook omdat deze ontwikkelingen direct
              samenhangen met risico's, verzekerbaarheid en de economische continuïteit van bedrijven.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Als Univé willen wij verkennen hoe we melkveehouders kunnen ondersteunen bij een
              toekomstbestendige en economisch gezonde bedrijfsvoering. We zijn ons ervan bewust dat
              veranderingen alleen haalbaar zijn als ze passen bij de praktijk en rendabel zijn voor de ondernemer.
              Daarom willen we van jullie informatie verkrijgen om te begrijpen wat er speelt. Met deze vragenlijst
              willen wij inzicht krijgen hoe je je bedrijf ervaart in de praktijk.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              De vragenlijst bevat ongeveer 20 vragen en duurt ongeveer 10–15 minuten. Aan het einde van de vragenlijst is
              ruimte voor aanvullende opmerkingen of toelichting. Deelname is vrijwillig en je antwoorden
              worden volledig anoniem verwerkt en zijn niet te herleiden tot individuele bedrijven. Er zijn geen
              goede of foute antwoorden – het gaat om jouw werkelijkheid. Je input helpt ons om concrete
              ondersteuning te ontwikkelen die bijdraagt aan meer zekerheid, risicobeperking en praktische
              haalbaarheid op het erf.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Je gegevens worden anoniem verwerkt; we vragen geen persoons- of bedrijfsgegevens. Meer hierover vind je in ons{" "}
            <a href="https://www.unive.nl/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">privacybeleid</a>.
          </p>

          <div className="flex flex-wrap gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <UserX className="h-5 w-5 shrink-0 text-primary" />
              <span>Anoniem</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Shield className="h-5 w-5 shrink-0 text-primary" />
              <span>Geen persoonsgegevens</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Clock className="h-5 w-5 shrink-0 text-primary" />
              <span>± 10–15 minuten</span>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/vragenlijst">
              <Button size="lg" className="w-full rounded-xl">
                Start vragenlijst
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
