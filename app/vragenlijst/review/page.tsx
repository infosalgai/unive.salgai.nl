"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  push("Uw bedrijf", "Type bedrijf", fd.q1 === "Anders" && fd.q1_anders ? fd.q1_anders : fd.q1);
  if (fd.q2_cows > 0 || fd.q2_hectares > 0) {
    push("Uw bedrijf", "Melkkoeien", fd.q2_cows);
    push("Uw bedrijf", "Hectares", fd.q2_hectares);
  }
  push("Uw bedrijf", "Fase", fd.q3);
  push("Toekomstbeeld", "Toekomstvertrouwen (1–7)", fd.q4);
  if (fd.q5) push("Toekomstbeeld", "Grootste zorgen", fd.q5);
  if (fd.q6.length) push("Toekomstbeeld", "Ontwikkelingen", fd.q6.join(", "));
  push("Toekomstbeeld", "Invloed (1–7)", fd.q7);
  push("Veranderingen", "Aanpassingen afgelopen 5 jaar", fd.q8);
  if (fd.q8a) push("Veranderingen", "Welke aanpassingen", fd.q8a);
  if (fd.q9.length) push("Veranderingen", "Aanleidingen", fd.q9.join(", "));
  if (fd.q10) push("Veranderingen", "Concrete aanleiding", fd.q10);
  push("Verdienmodel", "Stabiliteit (1–7)", fd.q11);
  if (fd.q12) push("Verdienmodel", "Kwetsbaarheid", fd.q12);
  if (fd.q13.length) push("Verdienmodel", "Afhankelijk van", fd.q13.join(", "));
  if (fd.q14.length) push("Verdienmodel", "Ruimte om te sturen", fd.q14.join(", "));
  push("Verdienmodel", "Behoefte verbreding (1–7)", fd.q15a);
  push("Verdienmodel", "Mogelijkheden verbreding", fd.q15b);
  if (fd.q16.length) push("Verdienmodel", "Vormen verbreding", fd.q16.join(", "));
  if (fd.q17.length) push("Wat houdt tegen", "Houdt tegen", fd.q17.join(", "));
  push("Wat houdt tegen", "Rol financiering (1–7)", fd.q18);
  if (fd.q19.length) push("Ondersteuning", "Waardevolle ondersteuning", fd.q19.join(", "));
  if (fd.q20) push("Ondersteuning", "Voorwaarden houtwallen", fd.q20);
  if (fd.q21) push("Ondersteuning", "Voorwaarden bomen", fd.q21);
  if (fd.q22) push("Afsluiting", "Liefst aanpassen", fd.q22);
  if (fd.q23) push("Afsluiting", "Wat partijen moeten begrijpen", fd.q23);
  if (fd.q_opmerkingen) push("Afsluiting", "Opmerkingen", fd.q_opmerkingen);
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
          <Link href="/intro" className="text-sm font-medium text-primary">
            Univé · Vragenlijst
          </Link>
          <Link
            href="/vragenlijst?stap=q22-q23"
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
            <Link href="/vragenlijst?stap=q22-q23">
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
