"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Share, Smartphone } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const STORAGE_KEY = "pwa-install-dismissed"
const IOS_PROMPT_KEY = "pwa-ios-prompt-dismissed"

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false)
  const [showIosPrompt, setShowIosPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Standalone = already installed (or opened from home screen)
    const standalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true)
    if (standalone) {
      setIsInstalled(true)
      return
    }

    // Android: listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
      const dismissed = typeof sessionStorage !== "undefined" && sessionStorage.getItem(STORAGE_KEY)
      if (!dismissed) setShowAndroidPrompt(true)
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // iOS: show instruction if Safari and not dismissed
    const isIos =
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: boolean }).MSStream
    const isSafari = typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    if (isIos && (isSafari || /CriOS|FxiOS/.test(navigator.userAgent))) {
      const dismissed = typeof sessionStorage !== "undefined" && sessionStorage.getItem(IOS_PROMPT_KEY)
      if (!dismissed) setShowIosPrompt(true)
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
  }, [])

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === "accepted") setShowAndroidPrompt(false)
    setInstallEvent(null)
  }

  const dismissAndroid = () => {
    setShowAndroidPrompt(false)
    try {
      sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // ignore
    }
  }

  const dismissIos = () => {
    setShowIosPrompt(false)
    try {
      sessionStorage.setItem(IOS_PROMPT_KEY, "1")
    } catch {
      // ignore
    }
  }

  if (isInstalled) return null

  return (
    <>
      {/* Android install CTA */}
      {showAndroidPrompt && installEvent && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm">
          <span className="text-sm font-medium text-foreground">App installeren</span>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="default" onClick={handleInstall}>
              <Smartphone className="mr-1 h-4 w-4" />
              Installeer
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={dismissAndroid} aria-label="Sluiten">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* iOS Add to Home Screen instruction */}
      {showIosPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border bg-card p-4 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Toevoegen aan beginscherm</span>
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={dismissIos} aria-label="Sluiten">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tik op <Share className="inline h-3.5 w-3.5" /> <strong>Deel</strong> onderaan en kies{" "}
            <strong>Zet op beginscherm</strong>.
          </p>
        </div>
      )}
    </>
  )
}
