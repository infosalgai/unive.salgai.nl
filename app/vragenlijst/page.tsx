"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Shield, Lock, FileCheck } from "lucide-react";
import { buildUniveScreens, isUniveStepValid, isStepConditionallyHidden } from "@/lib/unive-screens";
import { useUniveFormState } from "@/lib/use-unive-form-state";

export default function VragenlijstPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formData, update, toggleMulti } = useUniveFormState();
  const [stepError, setStepError] = useState<string | null>(null);
  const [currentStepPiiBlocked, setCurrentStepPiiBlocked] = useState(false);
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

  useEffect(() => {
    setCurrentStepPiiBlocked(false);
  }, [currentScreenIndex]);

  // Zorg dat eerste stap in URL staat als /vragenlijst?stap=q1
  useEffect(() => {
    if (!searchParams.get("stap") && currentScreen && currentScreen.stepNumber === 1) {
      router.replace(`/vragenlijst?stap=q${currentScreen.stepNumber}`);
    }
  }, [currentScreen, searchParams, router]);

  useEffect(() => {
    if (currentScreen && isUniveStepValid(currentScreen, formData, currentStepPiiBlocked)) setStepError(null);
  }, [currentScreen?.id, formData, currentStepPiiBlocked]);

  // Bij directe URL naar een voorwaardelijk scherm (q4a, q9): redirect naar een geldige stap
  useEffect(() => {
    if (!currentScreen) return;
    if (!isStepConditionallyHidden(currentScreen.id, formData)) return;
    if (currentScreen.id === "q4a") {
      const q4Screen = allScreens.find((s) => s.id === "q4");
      if (q4Screen) {
        router.replace(`/vragenlijst?stap=${getStepSlug(q4Screen)}`);
      }
      return;
    }
    let targetScreen: (typeof allScreens)[number] | null = null;
    for (let i = currentScreenIndex + 1; i < allScreens.length; i++) {
      const c = allScreens[i];
      if (c.id === "q4a") continue;
      if (c.id === "q9" && formData.q8 !== "Ja, meerdere" && formData.q8 !== "Ja, beperkt") continue;
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
      // q4a overgeslagen: regelgeving-doorvraag staat inlined op q4
      if (candidate.id === "q4a") {
        idx++;
        continue;
      }
      // q9 (aanleidingen) alleen tonen als bij q8 "Ja" is gekozen
      if (candidate.id === "q9" && formData.q8 !== "Ja, meerdere" && formData.q8 !== "Ja, beperkt") {
        idx++;
        continue;
      }
      // q11b alleen tonen bij minimaal 1 Ja bij vraag 11 (matrix)
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

  const handleNext = () => {
    if (currentScreen && !isUniveStepValid(currentScreen, formData, currentStepPiiBlocked)) {
      setStepError("Vul een geldig antwoord in om door te gaan. Vermijd namen of herleidbare gegevens in open velden.");
      setTimeout(() => stepErrorRef.current?.focus(), 100);
      return;
    }
    setStepError(null);

    const nextScreen = findNextScreen();
    if (nextScreen) {
      router.push(`/vragenlijst?stap=${getStepSlug(nextScreen)}`);
      scrollToTop();
    } else {
      router.push("/vragenlijst/review");
      scrollToTop();
    }
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
                    {(currentScreen.id === "q14_open" || currentScreen.id === "q16a") && currentScreen.subtitle ? (
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
                    {currentScreen.render(formData, update, toggleMulti, setCurrentStepPiiBlocked)}
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
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentScreenIndex === 0}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Vorige
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentScreen ? !isUniveStepValid(currentScreen, formData, currentStepPiiBlocked) : false}
              className="rounded-xl"
            >
              {currentScreenIndex === allScreens.length - 1 ? "Naar overzicht" : "Volgende"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
