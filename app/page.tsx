"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAccessGranted } from "@/components/access-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Univé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vragenlijst Melkveehouders
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code" className="text-foreground">
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
              placeholder="Voer de code in"
              className="mt-1.5"
              autoComplete="one-time-code"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full rounded-xl">
            Doorgaan
          </Button>
        </form>
      </div>
    </div>
  );
}
