"use client";

import React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NavHeader } from "@/components/nav-header";
import { AppFooter } from "@/components/app-footer";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDemoContext } from "@/lib/demo-data";
import {
  type UniveFormData,
  UNIVE_INITIAL_FORM_DATA,
} from "@/lib/unive-questionnaire";
import {
  buildUniveScreens,
  isUniveStepValid,
  UNIVE_TOTAL_QUESTIONS,
} from "../unive-screens";

const QUESTION_LABEL_CLASS = "mb-2 block text-base font-semibold text-foreground";

// â”€â”€ Main component (UnivÃ© Vragenlijst Melkveehouders) â”€â”€

export default function TimeoutFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<UniveFormData>(UNIVE_INITIAL_FORM_DATA)
  const [isGenerating, setIsGenerating] = useState(false)
  const [summaryText, setSummaryText] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const [showFeedbackField, setShowFeedbackField] = useState(false)
  const [summaryFeedback, setSummaryFeedback] = useState("")
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [currentStepPiiBlocked, setCurrentStepPiiBlocked] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const stepErrorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const { role, route } = getDemoContext()
    if (!role || route !== "timeout") {
      router.push("/demo")
    }
  }, [router])

  // Load saved form state from sessionStorage once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem("timeoutFormV2");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UniveFormData;
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Persist form state for refresh-safety
  useEffect(() => {
    if (typeof window === "undefined") return
    window.sessionStorage.setItem("timeoutFormV2", JSON.stringify(formData))
  }, [formData])

  const allScreens = useMemo(() => buildUniveScreens(), []);
  const visibleScreens = allScreens;

  const stepFromUrl = searchParams.get("stap") || visibleScreens[0]?.id;
  const isSummaryStep = stepFromUrl === "samenvatting";

  const currentScreenIndex = isSummaryStep
    ? visibleScreens.length - 1
    : Math.max(
        0,
        visibleScreens.findIndex((s) => s.id === stepFromUrl) === -1
          ? 0
          : visibleScreens.findIndex((s) => s.id === stepFromUrl)
      );

  const currentScreen = isSummaryStep ? null : visibleScreens[currentScreenIndex];
  const totalVisible = UNIVE_TOTAL_QUESTIONS;
  const totalStepsWithSummary = totalVisible + 1;
  const currentStepNumber = isSummaryStep ? totalVisible + 1 : currentScreenIndex + 1;
  const overallPercent = Math.round((currentStepNumber / totalStepsWithSummary) * 100);

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

  // Reset PII block when changing step
  useEffect(() => {
    setCurrentStepPiiBlocked(false);
  }, [stepFromUrl, currentScreenIndex]);

  // Clear step error when user makes a valid choice
  useEffect(() => {
    if (currentScreen && isUniveStepValid(currentScreen, formData, currentStepPiiBlocked)) setStepError(null);
  }, [currentScreen?.id, formData, currentStepPiiBlocked]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNext = async () => {
    if (isSummaryStep) return
    if (currentScreen && !isUniveStepValid(currentScreen, formData, currentStepPiiBlocked)) {
      setStepError("Vul een geldig antwoord in om door te gaan. Vermijd namen of herleidbare gegevens in open velden.")
      setTimeout(() => stepErrorRef.current?.focus(), 100)
      return
    }
    setStepError(null)
    const currentIndex = currentScreenIndex

    if (currentIndex < totalVisible - 1) {
      const nextId = visibleScreens[currentIndex + 1].id
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      params.set("stap", nextId)
      router.push(`/timeout/run/demo/form?${params.toString()}`)
      scrollToTop()
    } else {
      // Last question screen -> go to summary step
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      params.set("stap", "samenvatting")
      router.push(`/timeout/run/demo/form?${params.toString()}`)
      scrollToTop()

      // Trigger summary generation
      setIsGenerating(true)
      try {
        const res = await fetch("/api/timeout/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData }),
        })
        const data = await res.json()
        setSummaryText(data.summary)
      } catch {
        setSummaryText("De samenvatting kon niet worden gegenereerd. Controleer je verbinding en probeer het opnieuw, of ga terug om je antwoorden te controleren.")
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const handleBack = () => {
    setStepError(null)
    if (isSummaryStep) {
      // Back from summary to last visible vraag
      const lastId = visibleScreens[visibleScreens.length - 1]?.id
      if (lastId) {
        const params = new URLSearchParams(Array.from(searchParams.entries()))
        params.set("stap", lastId)
        router.push(`/timeout/run/demo/form?${params.toString()}`)
        scrollToTop()
      }
      return
    }

    const currentIndex = currentScreenIndex
    if (currentIndex > 0) {
      const prevId = visibleScreens[currentIndex - 1].id
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      params.set("stap", prevId)
      router.push(`/timeout/run/demo/form?${params.toString()}`)
      scrollToTop()
    }
  }

  const handleConfirmSend = () => {
    setShowConfirmModal(false)
    setIsSubmitted(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader showBack backHref="/timeout/start/demo" />

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {!isSubmitted && (
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
                <span className="min-w-[6rem] text-right text-sm font-medium text-muted-foreground tabular-nums">
                  {isSummaryStep ? "Samenvatting" : `Vraag ${currentScreenIndex + 1}/${UNIVE_TOTAL_QUESTIONS}`} ({overallPercent}%)
                </span>
              </div>
            </div>
          )}

          {/* â”€â”€ Summary step â”€â”€ */}
          {isSummaryStep ? (
            <>
              {isGenerating ? (
                <Card className="rounded-2xl">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-primary" />
                    <h2 className="mb-2 text-xl font-semibold text-foreground">We maken je samenvatting...</h2>
                    <p className="text-center text-muted-foreground">Even geduld, we verwerken je antwoorden.</p>
                    <div className="mt-8 w-full space-y-3">
                      <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                      <div className="h-4 w-11/12 animate-pulse rounded bg-secondary" />
                      <div className="h-4 w-10/12 animate-pulse rounded bg-secondary" />
                      <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                      <div className="h-4 w-9/12 animate-pulse rounded bg-secondary" />
                    </div>
                  </CardContent>
                </Card>
              ) : isSubmitted ? (
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="mb-2 text-2xl font-semibold text-foreground">Je samenvatting is gedeeld.</h2>
                  <p className="mb-8 text-muted-foreground">De voorbereiding is afgerond.</p>
                  <Button variant="outline" onClick={() => router.push("/dashboard/employee?flow=timeout")} className="rounded-xl bg-transparent">
                    Terug naar dashboard
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-center">
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                      Samenvatting
                    </p>
                    <h2 className="mb-1 text-xl font-semibold text-foreground">Samenvatting voor het gesprek</h2>
                    <p className="text-sm text-muted-foreground">Lees rustig. Jij bepaalt of dit klopt.</p>
                  </div>

                  <Card className="mb-4 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="prose prose-sm max-w-none">
                        {(summaryText ?? "").split("\n").map((line, i) => {
                          if (line.startsWith("## ")) return <h3 key={i} className="mb-2 mt-4 text-base font-semibold text-primary first:mt-0">{line.replace("## ", "")}</h3>
                          if (line.startsWith("- ")) return <p key={i} className="mb-1 pl-4 text-sm text-foreground">&#8226; {line.replace("- ", "")}</p>
                          if (line.trim() === "") return <div key={i} className="h-2" />
                          const parts = line.split(/(\*\*.*?\*\*)/)
                          return (
                            <p key={i} className="mb-2 text-sm leading-relaxed text-foreground">
                              {parts.map((part, j) => part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part)}
                            </p>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mb-6 rounded-2xl border-accent/30 bg-accent/5">
                    <CardContent className="p-4">
                      <p className="text-center text-sm font-medium text-foreground">
                        Is deze samenvatting juist en volledig genoeg voor het gesprek?
                      </p>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowFeedbackField((v) => !v)}
                      className="rounded-xl bg-transparent"
                    >
                      Nee, ik wil aanpassen
                    </Button>
                    <Button onClick={() => setShowConfirmModal(true)} className="rounded-xl">
                      <Send className="mr-2 h-4 w-4" />
                      Ja, dit klopt - delen met time-out coach
                    </Button>
                  </div>

                  {showFeedbackField && (
                    <Card className="mt-6 rounded-2xl border-primary/20 bg-primary/5">
                      <CardContent className="p-6">
                        <Label htmlFor="summary-feedback" className={QUESTION_LABEL_CLASS + " mb-1"}>
                          Wat wil je laten aanpassen?
                        </Label>
                        <p className={"mb-3 " + HELPER_TEXT_CLASS}>
                          Beschrijf in je eigen woorden wat er in de samenvatting anders moet. We passen de tekst aan en tonen de nieuwe versie.
                        </p>
                        <Textarea
                          id="summary-feedback"
                          value={summaryFeedback}
                          onChange={(e) => {
                            setSummaryFeedback(e.target.value)
                            setSummaryError(null)
                          }}
                          placeholder="Bijvoorbeeld: de volgorde van wat er speelt klopt niet, of ik mis dat..."
                          rows={4}
                          maxLength={800}
                          className="mb-4"
                          disabled={isGenerating}
                        />
                        {summaryError && (
                          <p className="mb-3 text-sm text-destructive" role="alert">
                            {summaryError}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={async () => {
                              const text = summaryFeedback.trim()
                              if (!text) {
                                setSummaryError("Vul in wat je wilt aanpassen.")
                                return
                              }
                              setSummaryError(null)
                              setIsGenerating(true)
                              try {
                                const res = await fetch("/api/timeout/summarize", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    formData,
                                    currentSummary: summaryText ?? "",
                                    feedback: text,
                                  }),
                                })
                                const data = await res.json()
                                if (!res.ok) {
                                  setSummaryError(data?.error ?? "Aanpassen mislukt. Probeer het later opnieuw.")
                                  return
                                }
                                const newSummary = data?.summary ?? ""
                                if (newSummary) {
                                  setSummaryText(newSummary)
                                  setSummaryFeedback("")
                                  setShowFeedbackField(false)
                                } else {
                                  setSummaryError("Geen nieuwe samenvatting ontvangen. Probeer het opnieuw.")
                                }
                              } catch {
                                setSummaryError("Er ging iets mis. Probeer het later opnieuw.")
                              } finally {
                                setIsGenerating(false)
                              }
                            }}
                            disabled={isGenerating}
                            className="rounded-xl"
                          >
                            {isGenerating ? "Bezig met aanpassen..." : "Pas samenvatting aan"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowFeedbackField(false)
                              setSummaryFeedback("")
                              setSummaryError(null)
                            }}
                            disabled={isGenerating}
                            className="rounded-xl bg-transparent"
                          >
                            Annuleren
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {/* â”€â”€ Question screen â”€â”€ */}
              <Card ref={cardRef} className="rounded-2xl">
                <CardContent className="p-6">
                  {currentScreen && (
                    <>
                      <div className="mb-4">
                        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                          {currentScreen.group === "Randvoorwaarden" ? "Voorwaarden" : currentScreen.group}
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
                            aria-live="polite"
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

              {/* Navigation */}
              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentScreenIndex === 0}
                  className="rounded-xl bg-transparent"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Vorige
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentScreen ? !isUniveStepValid(currentScreen, formData, currentStepPiiBlocked) : false}
                  className="rounded-xl"
                >
                  {currentScreenIndex === totalVisible - 1 ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Maak samenvatting
                    </>
                  ) : (
                    <>
                      Volgende
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <AppFooter />

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription className="space-y-3">
              <p>Alleen deze samenvatting wordt gedeeld met je time-out coach.</p>
              <p className="font-medium text-foreground">Klopt dit verhaal zoals jij het bedoelt?</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="rounded-xl bg-transparent">
              Nog even checken
            </Button>
            <Button onClick={handleConfirmSend} className="rounded-xl">
              <Send className="mr-2 h-4 w-4" />
              Ja, versturen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
