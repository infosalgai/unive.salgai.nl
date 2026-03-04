"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { UniveFormData } from "@/lib/unive-questionnaire";
import { UNIVE_INITIAL_FORM_DATA } from "@/lib/unive-questionnaire";

const FORM_STORAGE_KEY = "univeFormV2";

function formatForReview(fd: UniveFormData): { section: string; lines: string[] }[] {
  const sections: { section: string; lines: string[] }[] = [];
  const push = (section: string, label: string, value: unknown) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && !value.trim()) return;
    if (Array.isArray(value) && value.length === 0) return;
    let existing = sections.find((s) => s.section === section);
    if (!existing) {
      existing = { section, lines: [] };
      sections.push(existing);
    }
    const s = Array.isArray(value) ? value.join(", ") : String(value).trim();
    if (s) existing.lines.push(`${label}: ${s}`);
  };

  // Deel 1 – Uw bedrijf
  push("Uw bedrijf", "Type bedrijf", fd.q1 === "Anders" && fd.q1_anders ? fd.q1_anders : fd.q1);
  if (fd.q2_cows > 0 || fd.q2_hectares > 0) {
    push("Uw bedrijf", "Aantal melkvee", fd.q2_cows);
    push("Uw bedrijf", "Aantal hectares landbouwgrond", fd.q2_hectares);
  }
  push("Uw bedrijf", "Fase van het bedrijf", fd.q3);

  // Deel 2 – Huidige situatie en toekomstbeeld
  if (fd.q4.length) push("Huidige situatie en toekomstbeeld", "Ontwikkelingen met meeste invloed", fd.q4.join(", "));
  if (fd.q4.includes("Regelgeving") && fd.q4a.length)
    push("Huidige situatie en toekomstbeeld", "Regelgeving die vooral speelt", fd.q4a.join(", "));
  if (fd.q4.includes("Regelgeving") && fd.q4a.includes("Anders, namelijk:") && fd.q4a_anders)
    push("Huidige situatie en toekomstbeeld", "Regelgeving anders", fd.q4a_anders);
  push("Huidige situatie en toekomstbeeld", "Belang van verduurzaming (1–7)", fd.q5a);
  push("Huidige situatie en toekomstbeeld", "Verwachte invloed CO₂-reductie (1–7)", fd.q5b);
  push("Huidige situatie en toekomstbeeld", "Relevantie biodiversiteit (1–7)", fd.q5c);
  if (fd.q5_toelichting)
    push("Huidige situatie en toekomstbeeld", "Toelichting verduurzaming / CO₂ / biodiversiteit", fd.q5_toelichting);
  if (fd.q6) push("Huidige situatie en toekomstbeeld", "Grootste zorgen komende 5–10 jaar", fd.q6);
  push("Huidige situatie en toekomstbeeld", "Gevoel invloed op toekomst (1–7)", fd.q7);

  // Deel 3 – Veranderingen in bedrijfsvoering
  push("Veranderingen in bedrijfsvoering", "Aanpassingen afgelopen 5 jaar", fd.q8);
  if (fd.q8a) push("Veranderingen in bedrijfsvoering", "Welke aanpassingen", fd.q8a);
  if (fd.q9.length) push("Veranderingen in bedrijfsvoering", "Belangrijkste aanleidingen", fd.q9.join(", "));
  if (fd.q9.includes("Anders, namelijk:") && fd.q9_anders)
    push("Veranderingen in bedrijfsvoering", "Aanleidingen anders", fd.q9_anders);
  if (fd.q9.includes("Nieuwe regelgeving") && fd.q9_regelgeving)
    push("Veranderingen in bedrijfsvoering", "Welke regelgeving", fd.q9_regelgeving);
  if (fd.q10) push("Veranderingen in bedrijfsvoering", "Aanleiding om (opnieuw) aanpassingen te doen", fd.q10);
  if (fd.q11.length) push("Veranderingen in bedrijfsvoering", "Wat houdt u het meest tegen", fd.q11.join(", "));
  if (fd.q11.includes("Anders, namelijk:") && fd.q11_anders)
    push("Veranderingen in bedrijfsvoering", "Wat houdt tegen anders", fd.q11_anders);
  if (fd.q11_toelichting)
    push("Veranderingen in bedrijfsvoering", "Toelichting wat u tegenhoudt", fd.q11_toelichting);

  // Deel 4 – Welke ondersteuning zou helpen?
  push("Welke ondersteuning zou helpen", "Openheid voor ondersteuning van Univé (1–7)", fd.q12);
  if (fd.q13) push("Welke ondersteuning zou helpen", "Vormen van ondersteuning die waardevol zijn", fd.q13);
  if (fd.q14.length)
    push("Welke ondersteuning zou helpen", "Andere modellen/verduurzamingsopties", fd.q14.join(", "));
  if (fd.q14.includes("Anders, namelijk:") && fd.q14_anders)
    push("Welke ondersteuning zou helpen", "Andere verduurzamingsopties anders", fd.q14_anders);

  // Deel 5 – Verdienmodel en kwetsbaarheden
  push("Verdienmodel en kwetsbaarheden", "Behoefte aan aanvullende inkomsten/risicospreiding (1–7)", fd.q15a);
  push("Verdienmodel en kwetsbaarheden", "Mogelijkheden om inkomsten te verbreden/risico’s te spreiden", fd.q15b);
  if (fd.q15b_toelichting)
    push("Verdienmodel en kwetsbaarheden", "Toelichting bij mogelijkheden", fd.q15b_toelichting);
  if (fd.q16.length)
    push("Verdienmodel en kwetsbaarheden", "Wat rendabel ondernemen voor u betekent", fd.q16.join(", "));
  if (fd.q16.includes("Anders, namelijk:") && fd.q16_anders)
    push("Verdienmodel en kwetsbaarheden", "Rendabel ondernemen anders", fd.q16_anders);

  // Deel 7 – Afsluiting
  if (fd.q17)
    push("Afsluiting", "Wat u het liefst zou aanpassen aan uw huidige bedrijfsvoering", fd.q17);
  if (fd.q18)
    push(
      "Afsluiting",
      "Wat partijen zoals verzekeraars beter moeten begrijpen van de praktijk op uw erf",
      fd.q18,
    );
  if (fd.q19_toestemming_contact)
    push("Afsluiting", "Toestemming voor contact", fd.q19_toestemming_contact);
  if (fd.q19_opmerkingen) push("Afsluiting", "Aanvullende opmerkingen", fd.q19_opmerkingen);
  return sections;
}

export default function ReviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UniveFormData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(FORM_STORAGE_KEY);
    if (stored) {
      try {
        setFormData(JSON.parse(stored) as UniveFormData);
      } catch {
        setFormData(UNIVE_INITIAL_FORM_DATA);
      }
    } else {
      setFormData(UNIVE_INITIAL_FORM_DATA);
    }
  }, []);

  if (formData === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const sections = formatForReview(formData);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-[900px] items-center justify-between px-4">
          <UniveLogo height={36} href="/intro" />
          <Link
            href="/vragenlijst?stap=q19"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Controleer je antwoorden</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hieronder staan je antwoorden. Ga terug om iets aan te passen, of genereer je samenvatting.
            </p>
          </div>

          <div className="space-y-4">
            {sections.map(({ section, lines }) =>
              lines.length > 0 ? (
                <Card key={section} className="rounded-2xl">
                  <CardContent className="p-5">
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {section}
                    </h2>
                    <ul className="space-y-1.5 text-sm text-foreground">
                      {lines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : null
            )}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              size="lg"
              className="w-full rounded-xl"
              onClick={() => router.push("/vragenlijst/samenvatting")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Genereer samenvatting
            </Button>
            <Link href="/vragenlijst?stap=q19">
              <Button variant="outline" className="w-full rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Antwoorden aanpassen
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
