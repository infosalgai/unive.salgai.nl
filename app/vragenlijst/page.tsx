"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { buildUniveScreens, isUniveStepValid, isStepConditionallyHidden } from "@/lib/unive-screens";
import { useUniveFormState } from "@/lib/use-unive-form-state";

const FORM_STORAGE_KEY = "univeFormV2";

export default function VragenlijstPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formData, update, toggleMulti } = useUniveFormState();
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const stepErrorRef = useRef<HTMLParagraphElement>(null);

  const allScreens = useMemo(() => buildUniveScreens(), []);

  /** URL-slug: opeenvolgend q1, q2, … (zelfde nummering als webhook-payload). */
  const getStepSlug = (screen: (typeof allScreens)[number]) => `q${screen.stepNumber}`;

  const currentScreenIndex = useMemo(() => {
    if (!allScreens.length) return 0;
    const stepParam = searchParams.get("stap");
    if (!stepParam) return 0;

    // 1) Nieuwe URLs: stap gebaseerd op vraagnummer/-label (bijv. q13, q11b)
    //    Prefer screens die niet voorwaardelijk verborgen zijn (zoals q4a),
    //    zodat q8 naar de zichtbare vraag 8 gaat i.p.v. naar een hulpscherm.
    let slugIndex = allScreens.findIndex(
      (s) => getStepSlug(s) === stepParam && !isStepConditionallyHidden(s.id, formData)
    );
    if (slugIndex !== -1) return slugIndex;

    //    Fallback: eerste match ongeacht verborgenheid (backwards compatibility).
    slugIndex = allScreens.findIndex((s) => getStepSlug(s) === stepParam);
    if (slugIndex !== -1) return slugIndex;

    // 2) Match op stepNumber (stap=q1, q2, …)
    const stepNum = parseInt(stepParam.replace(/^q/, ""), 10);
    if (Number.isFinite(stepNum)) {
      const byStep = allScreens.findIndex(
        (s) => s.stepNumber === stepNum && !isStepConditionallyHidden(s.id, formData)
      );
      if (byStep !== -1) return byStep;
      const byStepAny = allScreens.findIndex((s) => s.stepNumber === stepNum);
      if (byStepAny !== -1) return byStepAny;
    }
    // 3) Backwards compatible: oude URLs op basis van interne id (bijv. q11)
    const idIndex = allScreens.findIndex((s) => s.id === stepParam);
    if (idIndex !== -1) return idIndex;

    return 0;
  }, [allScreens, searchParams, formData]);

  const currentScreen = allScreens[currentScreenIndex] ?? allScreens[0];
  const totalScreens = allScreens.length;
  const overallPercent = Math.round(((currentScreenIndex + 1) / totalScreens) * 100);

  // Zorg dat eerste stap in URL staat als /vragenlijst?stap=q1
  useEffect(() => {
    if (!searchParams.get("stap") && currentScreen && currentScreen.stepNumber === 1) {
      router.replace(`/vragenlijst?stap=q${currentScreen.stepNumber}`);
    }
  }, [currentScreen, searchParams, router]);

  useEffect(() => {
    if (currentScreen && isUniveStepValid(currentScreen, formData)) setStepError(null);
  }, [currentScreen?.id, formData]);

  // Bij directe URL naar een voorwaardelijk scherm (q4a, q11b): redirect naar een geldige stap
  useEffect(() => {
    if (!currentScreen) return;
    if (!isStepConditionallyHidden(currentScreen.id, formData)) return;
    if (currentScreen.id === "q4a") {
      const q6Screen = allScreens.find((s) => s.id === "q6");
      if (q6Screen) {
        router.replace(`/vragenlijst?stap=${getStepSlug(q6Screen)}`);
      }
      return;
    }
    let targetScreen: (typeof allScreens)[number] | null = null;
    for (let i = currentScreenIndex + 1; i < allScreens.length; i++) {
      const c = allScreens[i];
      if (c.id === "q4a") continue;
      if (c.id === "q11b" && isStepConditionallyHidden("q11b", formData)) continue;
      targetScreen = c;
      break;
    }
    if (!targetScreen) {
      for (let i = currentScreenIndex - 1; i >= 0; i--) {
        const c = allScreens[i];
        if (c.id === "q4a") continue;
        if (c.id === "q9" && formData.q8 !== "Ja, meerdere" && formData.q8 !== "Ja, beperkt") continue;
        if (c.id === "q11b" && isStepConditionallyHidden("q11b", formData)) continue;
        targetScreen = c;
        break;
      }
    }
    if (targetScreen) router.replace(`/vragenlijst?stap=${getStepSlug(targetScreen)}`);
  }, [currentScreen?.id, currentScreenIndex, formData, allScreens, router]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const findNextScreen = () => {
    let idx = currentScreenIndex + 1;
    while (idx < allScreens.length) {
      const candidate = allScreens[idx];
      // q4a overgeslagen: regelgeving-doorvraag staat inlined op q6
      if (candidate.id === "q4a") {
        idx++;
        continue;
      }
      // q11b alleen tonen bij minimaal 1 Ja bij vraag 10 (matrix)
      if (candidate.id === "q11b" && isStepConditionallyHidden("q11b", formData)) {
        idx++;
        continue;
      }
      return candidate;
    }
    return null;
  };

  const findPrevScreen = () => {
    let idx = currentScreenIndex - 1;
    while (idx >= 0) {
      const candidate = allScreens[idx];
      if (candidate.id === "q4a") {
        idx--;
        continue;
      }
      if (candidate.id === "q9" && formData.q8 !== "Ja, meerdere" && formData.q8 !== "Ja, beperkt") {
        idx--;
        continue;
      }
      if (candidate.id === "q11b" && isStepConditionallyHidden("q11b", formData)) {
        idx--;
        continue;
      }
      return candidate;
    }
    return null;
  };

  const handleSubmit = async () => {
    if (currentScreen?.id !== "q21" || !isUniveStepValid(currentScreen, formData)) return;
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
      router.push("/vragenlijst/bedankt");
      scrollToTop();
    } catch {
      setSubmitError("Versturen mislukt. Controleer je verbinding en probeer het opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentScreen && !isUniveStepValid(currentScreen, formData)) {
      setStepError("Vul een geldig antwoord in om door te gaan.");
      setTimeout(() => stepErrorRef.current?.focus(), 100);
      return;
    }
    setStepError(null);
    setSubmitError(null);

    const nextScreen = findNextScreen();
    if (nextScreen) {
      router.push(`/vragenlijst?stap=${getStepSlug(nextScreen)}`);
      scrollToTop();
    }
    // Geen overzicht meer: op q21 wordt direct verstuurd via "Antwoorden versturen"
  };

  const handleBack = () => {
    setStepError(null);
    const prevScreen = findPrevScreen();
    if (prevScreen) {
      router.push(`/vragenlijst?stap=${getStepSlug(prevScreen)}`);
      scrollToTop();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[900px] items-center px-4">
          <UniveLogo height={56} href="/intro" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <span className="min-w-[4rem] text-right text-sm font-medium text-muted-foreground tabular-nums">
                {overallPercent}%
              </span>
            </div>
          </div>

          <Card ref={undefined} className="rounded-2xl">
            <CardContent className="p-6">
              {currentScreen && (
                <>
                  <div className="mb-4">
                    {(currentScreen.id === "q14" || currentScreen.id === "q16") && currentScreen.subtitle ? (
                      <>
                        <p className="mb-3 text-base italic text-foreground/90">
                          {currentScreen.subtitle}
                        </p>
                        <h2 className="mb-1 text-xl font-semibold text-foreground">
                          {currentScreen.title}
                        </h2>
                      </>
                    ) : (
                      <>
                        <h2 className="mb-1 text-xl font-semibold text-foreground">
                          {currentScreen.title}
                        </h2>
                        {currentScreen.subtitle && (
                          <p className="text-sm text-muted-foreground">{currentScreen.subtitle}</p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="mt-4 space-y-6">
                    {currentScreen.render(formData, update, toggleMulti)}
                    {currentScreen.id === "q21" &&
                      isUniveStepValid(currentScreen, formData) && (
                      <div className="border-t border-border pt-6">
                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                          Antwoorden versturen
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Met de knop hieronder worden je antwoorden definitief naar Univé verzonden. Controleer of alles klopt voordat je verstuurt.
                        </p>
                      </div>
                    )}
                    {stepError && (
                      <p
                        ref={stepErrorRef}
                        role="alert"
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        tabIndex={-1}
                      >
                        {stepError}
                      </p>
                    )}
                    {currentScreen.id === "q21" && submitError && (
                      <p
                        role="alert"
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                      >
                        {submitError}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentScreenIndex === 0 || isSubmitting}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Vorige
            </Button>
            {currentScreen?.id === "q21" && isUniveStepValid(currentScreen, formData) ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                {isSubmitting ? "Bezig met verzenden…" : "Antwoorden versturen"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentScreen ? !isUniveStepValid(currentScreen, formData) : false}
                className="rounded-xl"
              >
                Volgende
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
