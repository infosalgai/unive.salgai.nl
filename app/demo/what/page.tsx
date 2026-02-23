"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppFooter } from "@/components/app-footer"
import { ArrowLeft, ArrowRight, Clock, MessageCircle } from "lucide-react"
import { getDemoContext, setDemoContext, ROUTE_CONFIG, type DemoRole, type DemoRoute } from "@/lib/demo-data"

const ROUTES: { value: DemoRoute; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: "timeout",
    label: "Time-out",
    description: ROUTE_CONFIG.timeout.description,
    icon: Clock,
  },
  {
    value: "navigation",
    label: "Navigatiegesprek",
    description: ROUTE_CONFIG.navigation.description,
    icon: MessageCircle,
  },
]

export default function DemoRouteSelectionPage() {
  const router = useRouter()
  const [selectedRoute, setSelectedRoute] = useState<DemoRoute | null>(null)
  const [role, setRole] = useState<DemoRole | null>(null)

  useEffect(() => {
    const { role: storedRole } = getDemoContext()
    if (!storedRole) {
      // No role set, redirect to role selection
      router.push("/demo")
      return
    }
    setRole(storedRole)
  }, [router])

  const handleStart = () => {
    if (!selectedRoute || !role) return
    
    // Store route in localStorage
    setDemoContext({ route: selectedRoute })
    
    // Route to matching dashboard with flow param
    const dashboardRoutes: Record<DemoRole, string> = {
      medewerker: "/dashboard/employee",
      coach: "/dashboard/coach",
      hr: "/dashboard/hr",
      manager: "/dashboard/leidinggevende",
    }
    router.push(`${dashboardRoutes[role]}?flow=${selectedRoute}`)
  }

  if (!role) {
    return null // Loading while checking role
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4">
                <Image
                  src="/images/vitalr-logo.png"
                  alt="Vitalr"
                  width={188}
                  height={45}
                  className="mx-auto h-10 w-auto"
                  priority
                />
              </div>
              <h1 className="mb-2 text-xl font-semibold text-foreground">
                Wat wil je bekijken?
              </h1>
              <p className="text-sm text-muted-foreground">
                Kies de route die je in deze demo wilt zien.
              </p>
            </div>

            {/* Route Options */}
            <div className="mb-6 space-y-3">
              {ROUTES.map((route) => {
                const Icon = route.icon
                const isSelected = selectedRoute === route.value
                return (
                  <button
                    key={route.value}
                    type="button"
                    onClick={() => setSelectedRoute(route.value)}
                    className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{route.label}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{route.description}</p>
                    </div>
                    {isSelected && (
                      <div className="mt-2 h-3 w-3 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl bg-transparent"
                asChild
              >
                <Link href="/demo">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Terug
                </Link>
              </Button>
              <Button
                onClick={handleStart}
                disabled={!selectedRoute}
                className="flex-1 rounded-xl"
              >
                Start demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <AppFooter />
    </div>
  )
}
