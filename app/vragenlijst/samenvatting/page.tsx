"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle, Shield, Lock, FileCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UniveFormData } from "@/lib/unive-questionnaire";
import { UNIVE_INITIAL_FORM_DATA } from "@/lib/unive-questionnaire";

const FORM_STORAGE_KEY = "univeFormV2";

export default function SamenvattingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UniveFormData | null>(null);
  const [summaryText, setSummaryText] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFeedbackField, setShowFeedbackField] = useState(false);
  const [summaryFeedback, setSummaryFeedback] = useState("");
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(FORM_STORAGE_KEY);
    const fd = stored ? (() => { try { return JSON.parse(stored) as UniveFormData; } catch { return null; } })() : null;
    setFormData(fd ?? UNIVE_INITIAL_FORM_DATA);
  }, []);

  useEffect(() => {
    if (formData === null) return;
    let cancelled = false;
    setIsGenerating(true);
    setSummaryError(null);
    fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.summary) setSummaryText(data.summary);
        else {
          const msg = data?.error ?? "De samenvatting kon niet worden gegenereerd. Controleer je verbinding of ga terug om je antwoorden te controleren.";
          setSummaryText(msg);
        }
      })
      .catch(() => {
        if (!cancelled) setSummaryText("De samenvatting kon niet worden gegenereerd. Controleer je verbinding en probeer het opnieuw.");
      })
      .finally(() => {
        if (!cancelled) setIsGenerating(false);
      });
    return () => { cancelled = true; };
  }, [formData]);

  const handleRevise = async () => {
    const text = summaryFeedback.trim();
    if (!text || formData === null) {
      setSummaryError("Vul in wat je wilt aanpassen.");
      return;
    }
    setSummaryError(null);
    setIsGenerating(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          currentSummary: summaryText,
          feedback: text,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSummaryError(data?.error ?? "Aanpassen mislukt. Probeer het later opnieuw.");
        return;
      }
      if (data?.summary) {
        setSummaryText(data.summary);
        setSummaryFeedback("");
        setShowFeedbackField(false);
      } else {
        setSummaryError("Geen nieuwe samenvatting ontvangen. Probeer het opnieuw.");
      }
    } catch {
      setSummaryError("Er ging iets mis. Probeer het later opnieuw.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmSend = async () => {
    if (formData === null || !summaryText.trim()) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, summary: summaryText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.error ?? "Versturen mislukt. Probeer het opnieuw.");
        return;
      }
      setShowConfirmModal(false);
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
          <UniveLogo height={80} href="/intro" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {isGenerating && !summaryText ? (
            <Card className="rounded-2xl" aria-busy="true" aria-live="polite">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-primary" aria-hidden />
                <h2 className="mb-2 text-xl font-semibold text-foreground">We maken je samenvatting...</h2>
                <p className="text-center text-muted-foreground">Even geduld, we verwerken je antwoorden.</p>
              </CardContent>
            </Card>
          ) : isSubmitted ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-foreground">Je samenvatting is opgeslagen.</h2>
              <p className="mb-8 text-muted-foreground">Bedankt voor het invullen van de vragenlijst.</p>
              <Link href="/intro">
                <Button variant="outline" className="rounded-xl">
                  Terug naar start
                </Button>
              </Link>
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
                      if (line.startsWith("## ")) return <h3 key={i} className="mb-2 mt-4 text-base font-semibold text-primary first:mt-0">{line.replace("## ", "")}</h3>;
                      if (line.startsWith("- ")) return <p key={i} className="mb-1 pl-4 text-sm text-foreground">• {line.replace("- ", "")}</p>;
                      if (line.trim() === "") return <div key={i} className="h-2" />;
                      const parts = line.split(/(\*\*.*?\*\*)/);
                      return (
                        <p key={i} className="mb-2 text-sm leading-relaxed text-foreground">
                          {parts.map((part, j) => (part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part))}
                        </p>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6 rounded-2xl border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-center text-sm font-medium text-foreground">
                    Is deze samenvatting juist en volledig genoeg voor het gesprek?
                  </p>
                </CardContent>
              </Card>

              {/* Wat gebeurt er als je doorstuurt – vertrouwen */}
              <Card className="mb-6 rounded-2xl border border-primary/20 bg-primary/5">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                    <Shield className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                    Wat gebeurt er als je kiest om door te sturen?
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                    Jij hebt de regie. Alleen als je op &quot;Ja, dit klopt&quot; klikt en daarna bevestigt, worden je gegevens verstuurd. Tot dat moment blijft alles alleen op dit apparaat.
                  </p>
                  <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed" role="list">
                    <li className="flex gap-2">
                      <FileCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                      <span><strong className="text-foreground">Wat we versturen:</strong> je samenvatting en de antwoorden uit de vragenlijst. Die worden gebruikt om je gesprek of ondersteuning goed voor te bereiden.</span>
                    </li>
                    <li className="flex gap-2">
                      <Lock className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                      <span><strong className="text-foreground">Veilig en vertrouwelijk:</strong> de gegevens worden versleuteld verzonden en alleen door Univé verwerkt volgens ons privacybeleid. We gebruiken ze voor het doel van deze vragenlijst.</span>
                    </li>
                    <li className="flex gap-2">
                      <Shield className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                      <span><strong className="text-foreground">Geen verrassingen:</strong> je kunt altijd nog &quot;Nee, ik wil aanpassen&quot; kiezen of het venster sluiten. Versturen doe je alleen als jij dat wilt.</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Meer over hoe we omgaan met je gegevens:{" "}
                    <a href="https://www.unive.nl/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded">
                      privacybeleid Univé
                    </a>
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button variant="outline" onClick={() => setShowFeedbackField((v) => !v)} className="rounded-xl">
                  Nee, ik wil aanpassen
                </Button>
                <Button onClick={() => setShowConfirmModal(true)} className="rounded-xl">
                  <Send className="mr-2 h-4 w-4" />
                  Ja, dit klopt
                </Button>
              </div>

              {showFeedbackField && (
                <Card className="mt-6 rounded-2xl border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <Label htmlFor="summary-feedback" className="mb-1 block font-semibold">
                      Wat wil je laten aanpassen?
                    </Label>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Beschrijf in je eigen woorden wat er in de samenvatting anders moet.
                    </p>
                    <Textarea
                      id="summary-feedback"
                      value={summaryFeedback}
                      onChange={(e) => { setSummaryFeedback(e.target.value); setSummaryError(null); }}
                      placeholder="Bijvoorbeeld: de volgorde van wat er speelt klopt niet..."
                      rows={4}
                      maxLength={800}
                      className="mb-4"
                      disabled={isGenerating}
                    />
                    {summaryError && <p className="mb-3 text-sm text-destructive" role="alert">{summaryError}</p>}
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleRevise} disabled={isGenerating} className="rounded-xl">
                        {isGenerating ? "Bezig met aanpassen..." : "Pas samenvatting aan"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => { setShowFeedbackField(false); setSummaryFeedback(""); setSummaryError(null); }}
                        disabled={isGenerating}
                        className="rounded-xl"
                      >
                        Annuleren
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <Dialog open={showConfirmModal} onOpenChange={(open) => { setShowConfirmModal(open); if (!open) setSubmitError(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription className="space-y-3">
              <p>Deze samenvatting is gebaseerd op je antwoorden.</p>
              <p className="font-medium text-foreground">Klopt dit verhaal zoals jij het bedoelt?</p>
              <p className="text-sm">
                Als je op &quot;Ja, versturen&quot; klikt, worden je samenvatting en antwoorden veilig naar Univé gestuurd en vertrouwelijk verwerkt voor het voorbereiden van je gesprek of ondersteuning.
              </p>
            </DialogDescription>
          </DialogHeader>
          {submitError && (
            <p className="text-sm text-destructive" role="alert">{submitError}</p>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="rounded-xl"
              disabled={isSubmitting}
            >
              Nog even checken
            </Button>
            <Button onClick={handleConfirmSend} className="rounded-xl" disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Bezig met versturen…" : "Ja, versturen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
