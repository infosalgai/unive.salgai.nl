"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const GATE_PATHS = ["/"];
const ACCESS_KEY = "unive_access_granted";

export function useAccessGranted(): boolean | null {
  const [granted, setGranted] = useState<boolean | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setGranted(localStorage.getItem(ACCESS_KEY) === "true");
  }, []);
  return granted;
}

export function setAccessGranted(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) localStorage.setItem(ACCESS_KEY, "true");
  else localStorage.removeItem(ACCESS_KEY);
}

export function AccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const isGate = GATE_PATHS.includes(pathname ?? "");
    if (isGate) return;
    const granted = localStorage.getItem(ACCESS_KEY) === "true";
    if (!granted) router.replace("/");
  }, [mounted, pathname, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Laden">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      </div>
    );
  }

  const isGate = GATE_PATHS.includes(pathname ?? "");
  const granted = typeof window !== "undefined" && localStorage.getItem(ACCESS_KEY) === "true";
  if (!isGate && !granted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Laden">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      </div>
    );
  }

  return <>{children}</>;
}
