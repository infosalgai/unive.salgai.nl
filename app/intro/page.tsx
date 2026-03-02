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
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Deze vragenlijst is bedoeld voor melkveehouders. We willen graag inzicht in hoe u
              naar de toekomst van uw bedrijf kijkt, welke risico’s en kansen u ziet, en welke
              ondersteuning voor u waardevol zou zijn. Uw antwoorden helpen om het gesprek over
              uw bedrijf en verduurzaming beter te laten aansluiten op uw situatie.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-3">Privacy</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• De vragenlijst is <strong className="text-foreground">anoniem</strong>.</li>
              <li>• We vragen <strong className="text-foreground">geen persoons- of bedrijfsgegevens</strong> (geen namen, e-mail, adres of KvK).</li>
              <li>• Invullen duurt ongeveer <strong className="text-foreground">10 tot 15 minuten</strong>.</li>
            </ul>
          </div>

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
