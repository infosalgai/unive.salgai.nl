"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { AppFooter } from "@/components/app-footer"
import { Shield, Users, FileText, Clock, TrendingUp, BarChart3 } from "lucide-react"
import { hrStats, getDemoContext, ROUTE_CONFIG, type DemoRole, type DemoRoute } from "@/lib/demo-data"
import { hasRole, DEMO_ROLE_TO_USER_ROLE } from "@/lib/rbac"

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon 
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

function SimpleBarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function FunnelChart({ data }: { data: { step: string; count: number; percentage: number }[] }) {
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={item.step} className="flex items-center gap-3">
          <div className="w-6 text-center text-sm font-medium text-muted-foreground">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-foreground">{item.step}</span>
              <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-3 rounded-full bg-accent transition-all"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HRDashboard() {
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
    if (!hasRole(userRole, ["hr"])) {
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader role="hr" route={demoRoute} />

      <main className="mx-auto max-w-[900px] px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            HR Dashboard - {routeConfig.label}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {demoRoute === "timeout"
              ? "Geanonimiseerde statistieken over time-out aanvragen."
              : "Geanonimiseerde statistieken over navigatiegesprekken."
            }
          </p>
        </div>

        {/* Privacy Callout */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Privacy-bescherming</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Dit dashboard is volledig geanonimiseerd. Er is geen inzage in persoonlijke 
              antwoorden of samenvattingen. Je ziet alleen geaggregeerde cijfers over gebruik.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Aanvragen (30 dagen)"
            value={hrStats.totalRequests30Days}
            icon={FileText}
          />
          <StatCard
            title="Unieke medewerkers"
            value={hrStats.uniqueEmployees}
            icon={Users}
          />
          <StatCard
            title="Gedeeld met coach"
            value={hrStats.sharedWithCoach}
            subtitle={`${Math.round((hrStats.sharedWithCoach / hrStats.totalRequests30Days) * 100)}% van totaal`}
            icon={TrendingUp}
          />
          <StatCard
            title="Gem. doorlooptijd"
            value={`${hrStats.avgDaysToApproval} dagen`}
            subtitle="tot akkoord"
            icon={Clock}
          />
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Requests per Week */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Aanvragen per week</CardTitle>
              </div>
              <CardDescription>Laatste 4 weken</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={hrStats.requestsPerWeek.map(w => ({ label: w.week, value: w.count }))}
              />
            </CardContent>
          </Card>

          {/* Top Themes */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Meest genoemde thema's</CardTitle>
              </div>
              <CardDescription>Geanonimiseerd overzicht</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={hrStats.topThemes.map(t => ({ label: t.theme, value: t.count }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Funnel */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Proces-funnel</CardTitle>
            <CardDescription>
              Conversie van start tot gedeeld met coach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart data={hrStats.approvalFunnel} />
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Demo data - geen echte statistieken. Laatste update: 02-02-2026
        </p>
      </main>
      <AppFooter />
    </div>
  )
}
