"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { AppFooter } from "@/components/app-footer"
import { Shield, Users, ClipboardList, Calendar, AlertCircle } from "lucide-react"
import {
  managerTeamStats,
  getDemoContext,
  ROUTE_CONFIG,
  type DemoRole,
  type DemoRoute,
} from "@/lib/demo-data"
import { hasRole, DEMO_ROLE_TO_USER_ROLE } from "@/lib/rbac"

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LeidinggevendeDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [demoRoute, setDemoRoute] = useState<DemoRoute>("navigation")
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const { role, route } = getDemoContext()
    if (!role) {
      router.replace("/demo")
      return
    }
    if (!route) {
      router.replace("/demo/what")
      return
    }
    const userRole = DEMO_ROLE_TO_USER_ROLE[role as DemoRole]
    if (!hasRole(userRole, ["manager"])) {
      router.replace("/demo")
      return
    }
    setAllowed(true)
    const flowParam = searchParams.get("flow") as DemoRoute | null
    setDemoRoute(flowParam || route)
  }, [router, searchParams])

  if (allowed !== true) {
    return null
  }

  const routeConfig = ROUTE_CONFIG[demoRoute]
  const stats = managerTeamStats

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader role="manager" route={demoRoute} />

      <main className="mx-auto max-w-[900px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Dashboard Leidinggevende – {routeConfig.label}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Alleen status en voortgang van je team. Geen inhoudelijke of gevoelige gegevens.
          </p>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Privacy: alleen procesniveau</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Je ziet geen medische details, vrije tekst of exacte antwoorden van medewerkers.
              Alleen aantallen en status (bijv. time-out aangevraagd, in gesprek, afgerond).
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Lopende trajecten in team"
            value={stats.ongoingTrajecten}
            subtitle={stats.teamLabel}
            icon={Users}
          />
          <StatCard
            title="Volgende actie: plan gesprek"
            value={stats.volgendeActies.find((a) => a.label.includes("Plan gesprek"))?.count ?? 0}
            subtitle="Te plannen"
            icon={Calendar}
          />
          <StatCard
            title="Afgerond (30 dagen)"
            value={stats.statusOverzicht.find((s) => s.status.includes("Afgerond"))?.count ?? 0}
            subtitle="In deze periode"
            icon={ClipboardList}
          />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Status-overzicht team</CardTitle>
              </div>
              <CardDescription>Alleen processtatus, geen inhoud</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {stats.statusOverzicht.map((item) => (
                  <li
                    key={item.status}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">{item.status}</span>
                    <span className="font-medium text-muted-foreground">{item.count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Volgende acties</CardTitle>
              </div>
              <CardDescription>Wat staat er op de planning</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {stats.volgendeActies.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">{item.label}</span>
                    <span className="font-medium text-muted-foreground">{item.count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Geen exports of organisatiebrede trends beschikbaar voor leidinggevenden. Alleen
              team-overzicht op procesniveau.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Demo data – geen echte statistieken. Laatste update: 02-02-2026
        </p>
      </main>
      <AppFooter />
    </div>
  )
}
