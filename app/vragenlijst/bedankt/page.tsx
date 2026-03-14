"use client";

import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const UNIVE_WEBSITE_URL = "https://www.unive.nl/";

export default function BedanktPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[900px] items-center px-4">
          <UniveLogo height={56} href="/intro" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-12">
        <div className="mx-auto max-w-2xl flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle className="h-10 w-10" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Antwoorden succesvol verzonden
          </h1>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            De vragenlijst is afgerond. Je antwoorden zijn veilig ontvangen door Univé.
          </p>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Hartelijk bedankt voor je medewerking. Je input helpt Univé bij het onderzoek.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 rounded-xl"
          >
            <a href={UNIVE_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
              Afsluiten
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
