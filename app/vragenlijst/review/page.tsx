"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { UNIVE_INITIAL_FORM_DATA, normalizeFormData } from "@/lib/unive-questionnaire";
import type { UniveFormData } from "@/lib/unive-questionnaire";

const FORM_STORAGE_KEY = "univeFormV2";

export default function ReviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UniveFormData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(FORM_STORAGE_KEY);
    try {
      setFormData(stored ? normalizeFormData(JSON.parse(stored) as unknown) : UNIVE_INITIAL_FORM_DATA);
    } catch {
      setFormData(UNIVE_INITIAL_FORM_DATA);
    }
  }, []);

  if (formData === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Laden">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[900px] items-center px-4">
          <UniveLogo height={56} href="/intro" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Maak een samenvatting op basis van je antwoorden</h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Bedankt voor het invullen van de vragenlijst. Je kunt nu een samenvatting laten genereren: een lopend verhaal in eenvoudige taal, op basis van wat je hebt ingevuld. Of pas eerst nog iets aan.
            </p>
            <p className="mt-3 max-w-md text-xs text-muted-foreground">
              De samenvatting wordt gegenereerd met behulp van een taalmodel: je antwoorden worden omgezet naar een begrijpelijke, doorlopende tekst in de &quot;je&quot;-vorm, zonder advies – puur een weergave van jouw situatie en keuzes.
            </p>
          </div>

          <div className="flex flex-col gap-3">
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
