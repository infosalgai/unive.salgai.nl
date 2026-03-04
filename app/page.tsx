"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAccessGranted } from "@/components/access-guard";
import { UniveLogo } from "@/components/unive-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, ClipboardList, ArrowRight, Shield } from "lucide-react";

const VALID_CODE = "unive2026";

export default function GatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = code.trim();
    if (trimmed !== VALID_CODE) {
      setError("Deze code klopt niet. Controleer de code en probeer het opnieuw.");
      return;
    }
    setAccessGranted(true);
    router.push("/intro");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo – groter en centraal */}
        <div className="flex flex-col items-center text-center">
          <UniveLogo height={88} className="mb-6" />
          <div className="flex items-center gap-2 text-primary mb-1">
            <ClipboardList className="h-5 w-5 shrink-0" aria-hidden />
            <span className="text-sm font-medium">Vragenlijst melkveehouders</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Vul je code in om toegang te krijgen tot de anonieme vragenlijst.
          </p>
        </div>

        {/* Formulier in een lichte kaart */}
        <div className="rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code" className="flex items-center gap-2 text-foreground">
                <KeyRound className="h-4 w-4 text-primary" aria-hidden />
                Toegangscode
              </Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                placeholder="Voer je code in"
                className="mt-2"
                autoComplete="one-time-code"
                autoFocus
              />
              {error && (
                <p className="mt-2 flex items-center gap-2 text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full rounded-xl gap-2" size="lg">
              Doorgaan
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </form>
        </div>

        {/* Korte vertrouwelijkheid */}
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Anoniem · Geen persoonsgegevens
        </p>
      </div>
    </div>
  );
}
