"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { UNIVE_INITIAL_FORM_DATA, normalizeFormData } from "@/lib/unive-questionnaire";
import type { UniveFormData } from "@/lib/unive-questionnaire";

const FORM_STORAGE_KEY = "univeFormV2";

export default function ReviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UniveFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = async () => {
    if (!formData) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.error ?? "Versturen mislukt. Probeer het later opnieuw.");
        return;
      }
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(FORM_STORAGE_KEY);
      }
      setIsSubmitted(true);
    } catch {
      setSubmitError("Versturen mislukt. Controleer je verbinding en probeer het opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[900px] items-center px-4">
          <UniveLogo height={56} href="/intro" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {isSubmitted ? (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Je antwoorden zijn verstuurd.</h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Op basis van je antwoorden is een samenvatting gemaakt en veilig doorgestuurd naar Univé voor het doel van deze vragenlijst.
              </p>
              <Button
                className="mt-6 rounded-xl"
                variant="outline"
                onClick={() => router.push("/intro")}
              >
                Terug naar start
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Bijna klaar met de vragenlijst</h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Controleer gerust nog even je antwoorden. Als alles klopt, kun je jouw antwoorden nu versturen.
              </p>
            </div>
          )}

          {!isSubmitted && (
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full rounded-xl"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Bezig met verzenden…" : "Antwoorden versturen"}
              </Button>
              <Link href="/vragenlijst?stap=q22">
                <Button variant="outline" className="w-full rounded-xl" disabled={isSubmitting}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Antwoorden aanpassen
                </Button>
              </Link>
              {submitError && (
                <p className="text-sm text-destructive text-center" role="alert">
                  {submitError}
                </p>
              )}
            </div>
          )}

          {/* Op deze pagina hoeft de gebruiker alleen te zien dat de antwoorden verstuurd kunnen worden. */}
        </div>
      </main>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-5 shadow-lg">
            <div
              className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
              aria-hidden
            />
            <p className="text-sm font-medium text-foreground">Je antwoorden worden verstuurd…</p>
            <p className="mt-1 text-xs text-muted-foreground">Dit kan een paar tellen duren, even geduld.</p>
          </div>
        </div>
      )}
    </div>
  );
}
