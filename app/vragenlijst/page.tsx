"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
  const stepFromUrl = searchParams.get("stap") || allScreens[0]?.id;
  const currentScreenIndex = Math.max(
    0,
    allScreens.findIndex((s) => s.id === stepFromUrl) === -1
      ? 0
      : allScreens.findIndex((s) => s.id === stepFromUrl)
  );
  const currentScreen = allScreens[currentScreenIndex];
  const totalScreens = allScreens.length;
  const overallPercent = Math.round(((currentScreenIndex + 1) / totalScreens) * 100);

  useEffect(() => {
    setCurrentStepPiiBlocked(false);
  }, [stepFromUrl, currentScreenIndex]);

  useEffect(() => {
    if (currentScreen && isUniveStepValid(currentScreen, formData, currentStepPiiBlocked)) setStepError(null);
  }, [currentScreen?.id, formData, currentStepPiiBlocked]);

  // Bij directe URL naar een voorwaardelijk scherm (q4a, q9): redirect naar een geldige stap
  useEffect(() => {
    if (!currentScreen) return;
    if (!isStepConditionallyHidden(currentScreen.id, formData)) return;
    let targetId: string | null = null;
    for (let i = currentScreenIndex + 1; i < allScreens.length; i++) {
      const c = allScreens[i];
      if (c.id === "q4a" && !(Array.isArray(formData.q4) && formData.q4.includes("Regelgeving"))) continue;
      if (c.id === "q9" && formData.q8 !== "Ja, meerdere" && formData.q8 !== "Ja, beperkt") continue;
      targetId = c.id;
      break;
    }
    if (!targetId) {
      for (let i = currentScreenIndex - 1; i >= 0; i--) {
        const c = allScreens[i];
        if (c.id === "q4a" && !(Array.isArray(formData.q4) && formData.q4.includes("Regelgeving"))) continue;
        if (c.id === "q9" && formData.q8 !== "Ja, meerdere" && formData.q8 !== "Ja, beperkt") continue;
        targetId = c.id;
        break;
      }
    }
    if (targetId) router.replace(`/vragenlijst?stap=${targetId}`);
  }, [currentScreen?.id, currentScreenIndex, formData.q4, formData.q8, allScreens, router]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const findNextStepId = () => {
    let idx = currentScreenIndex + 1;
    while (idx < allScreens.length) {
      const candidate = allScreens[idx];
      // q4a alleen tonen als bij q4 "Regelgeving" is aangevinkt
      if (candidate.id === "q4a" && !(Array.isArray(formData.q4) && formData.q4.includes("Regelgeving"))) {
        idx++;
        continue;
      }
      // q9 (aanleidingen) alleen tonen als bij q8 "Ja" is gekozen
      if (candidate.id === "q9" && formData.q8 !== "Ja, meerdere" && formData.q8 !== "Ja, beperkt") {
        idx++;
        continue;
      }
      return candidate.id;
    }
    return null;
  };

  const findPrevStepId = () => {
    let idx = currentScreenIndex - 1;
    while (idx >= 0) {
      const candidate = allScreens[idx];
      if (candidate.id === "q4a" && !(Array.isArray(formData.q4) && formData.q4.includes("Regelgeving"))) {
        idx--;
        continue;
      }
      if (candidate.id === "q9" && formData.q8 !== "Ja, meerdere" && formData.q8 !== "Ja, beperkt") {
        idx--;
        continue;
      }
      return candidate.id;
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

    const nextId = findNextStepId();
    if (nextId) {
      router.push(`/vragenlijst?stap=${nextId}`);
      scrollToTop();
    } else {
      router.push("/vragenlijst/review");
      scrollToTop();
    }
  };

  const handleBack = () => {
    setStepError(null);
    const prevId = findPrevStepId();
    if (prevId) {
      router.push(`/vragenlijst?stap=${prevId}`);
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
                    <h2 className="mb-1 text-xl font-semibold text-foreground">{currentScreen.title}</h2>
                    {currentScreen.subtitle && (
                      <p className="text-sm text-muted-foreground">{currentScreen.subtitle}</p>
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
