"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppFooter } from "@/components/app-footer"
import { User, Users, Building2, UserCog, ArrowRight } from "lucide-react"
import { setDemoContext, type DemoRole } from "@/lib/demo-data"

const ROLES: { value: DemoRole; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: "medewerker",
    label: "Als medewerker",
    description: "Vraag een navigatiegesprek of time-out aan en behoud de regie over je eigen gegevens.",
    icon: User,
  },
  {
    value: "coach",
    label: "Als coach",
    description: "Bekijk aanvragen en samenvattingen na toestemming van de medewerker.",
    icon: Users,
  },
  {
    value: "hr",
    label: "Als HR",
    description: "Bekijk geanonimiseerde rapportages en trends. Geen medische details of vrije tekst van medewerkers.",
    icon: Building2,
  },
  {
    value: "manager",
    label: "Als leidinggevende",
    description: "Zie alleen status en voortgang van je team op procesniveau. Geen inhoudelijke of gevoelige antwoorden.",
    icon: UserCog,
  },
]

export default function DemoRoleSelectionPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<DemoRole | null>(null)

  const handleContinue = () => {
    if (!selectedRole) return
    
    // Store role in localStorage for demo persistence
    setDemoContext({ role: selectedRole })
    
    // Go to route selection
    router.push("/demo/what")
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
              Als wie wil je de demo bekijken?
            </h1>
            <p className="text-sm text-muted-foreground">
              Kies een rol om de bijbehorende weergave te zien.
            </p>
          </div>

          {/* Role Options */}
          <div className="mb-6 space-y-3">
            {ROLES.map((role) => {
              const Icon = role.icon
              const isSelected = selectedRole === role.value
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
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
                    <p className="font-medium text-foreground">{role.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  {isSelected && (
                    <div className="mt-2 h-3 w-3 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full rounded-xl"
            size="lg"
          >
            Ga verder
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {/* Info text */}
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Dit is een demo. Je kunt later van rol wisselen via de header.
            </p>
          </CardContent>
        </Card>
      </div>
      <AppFooter />
    </div>
  )
}
