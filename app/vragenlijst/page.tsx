"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { type UniveFormData, UNIVE_INITIAL_FORM_DATA, normalizeFormData } from "@/lib/unive-questionnaire";
import { buildUniveScreens, isUniveStepValid, isStepConditionallyHidden } from "@/lib/unive-screens";

const FORM_STORAGE_KEY = "univeFormV2";

export default function VragenlijstPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<UniveFormData>(UNIVE_INITIAL_FORM_DATA);
  const [stepError, setStepError] = useState<string | null>(null);
  const [currentStepPiiBlocked, setCurrentStepPiiBlocked] = useState(false);
  const stepErrorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(FORM_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        setFormData(normalizeFormData(parsed));
      } catch {
        // bij parsefout: blijf bij initiële data
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

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

  const update = useCallback((partial: Partial<UniveFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleMulti = useCallback((field: keyof UniveFormData, value: string, max?: number) => {
    setFormData((prev) => {
      const current = (prev[field] as string[]) ?? [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      }
      if (max && current.length >= max) return prev;
      return { ...prev, [field]: [...current, value] };
    });
  }, []);

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
        <div className="mx-auto flex h-14 max-w-[900px] items-center justify-between px-4">
          <UniveLogo height={36} href="/intro" />
          <Link
            href="/intro"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Link>
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
              <span className="min-w-[6rem] text-right text-sm font-medium text-muted-foreground tabular-nums">
                Vraag {currentScreenIndex + 1}/{totalScreens} ({overallPercent}%)
              </span>
            </div>
          </div>

          <Card ref={undefined} className="rounded-2xl">
            <CardContent className="p-6">
              {currentScreen && (
                <>
                  <div className="mb-4">
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                      {currentScreen.group}
                    </p>
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
