"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavHeader } from "@/components/nav-header"
import { ArrowLeft, Send, Loader2, User, MessageSquare, FileText } from "lucide-react"
import { getDemoContext } from "@/lib/demo-data"
import type { TaskFromSummary } from "@/lib/task/taskSchema"
import { EXPERT_TYPE_LABELS } from "@/lib/task/taskSchema"
import { useToast } from "@/hooks/use-toast"

const STORAGE_KEYS = {
  task: "timeoutTask",
  confirmedSummary: "timeoutConfirmedSummary",
  submissionId: "timeoutSubmissionId",
}

export default function TimeoutCoachTaskPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [task, setTask] = useState<TaskFromSummary | null>(null)
  const [confirmedSummary, setConfirmedSummary] = useState<string>("")
  const [submissionId, setSubmissionId] = useState<string>("")
  const [isReady, setIsReady] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)

  useEffect(() => {
    const { role, route } = getDemoContext()
    if (!role || route !== "timeout") {
      router.push("/demo")
      return
    }

    const savedTask = sessionStorage.getItem(STORAGE_KEYS.task)
    const savedSummary = sessionStorage.getItem(STORAGE_KEYS.confirmedSummary)
    const savedId = sessionStorage.getItem(STORAGE_KEYS.submissionId)

    if (!savedTask || !savedId) {
      router.push("/timeout/run/demo/summary")
      return
    }

    try {
      setTask(JSON.parse(savedTask) as TaskFromSummary)
      setConfirmedSummary(savedSummary ?? "")
      setSubmissionId(savedId)
    } catch {
      router.push("/timeout/run/demo/summary")
      return
    }
    setIsReady(true)
  }, [router])

  const handleSendToCoach = async () => {
    if (!task || !submissionId) return
    setSendLoading(true)
    try {
      const res = await fetch("/api/timeout/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: submissionId, task }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast({
          variant: "destructive",
          title: "Fout",
          description: data.error ?? "Versturen mislukt.",
        })
        return
      }
      toast({
        title: "Verzonden",
        description: "De opdracht is naar de Time-out coach gestuurd.",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Versturen mislukt.",
      })
    } finally {
      setSendLoading(false)
    }
  }

  if (!isReady || !task) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader showBack={false} />
        <main className="mx-auto max-w-[900px] px-4 py-8">
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader showBack backHref="/timeout/run/demo/summary" />

      <main className="mx-auto max-w-[900px] px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-2xl font-semibold text-primary">
            Overzicht voor de Time-Out coach
          </h1>
          <p className="mb-6 text-muted-foreground">
            Deze opdracht is gegenereerd op basis van de bevestigde samenvatting van de medewerker.
          </p>

          {/* Bevestigde samenvatting (optioneel) */}
          {confirmedSummary && (
            <Card className="mb-6 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Bevestigde samenvatting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {confirmedSummary.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed text-foreground last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sectie 1: Opdracht in het kort */}
          {task.summary_public && (
            <Card className="mb-6 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Opdracht in het kort</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-foreground">{task.summary_public}</p>
              </CardContent>
            </Card>
          )}

          {/* Sectie 2: Aanbevolen expert */}
          <Card className="mb-6 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Aanbevolen expert (na gesprek)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">Primair</p>
                <p className="font-medium">
                  {EXPERT_TYPE_LABELS[task.recommended_expert.primary.type] ??
                    task.recommended_expert.primary.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  {task.recommended_expert.primary.motivation}
                </p>
              </div>
              {task.recommended_expert.alternatives.length > 0 && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Alternatieven</p>
                  <ul className="space-y-2">
                    {task.recommended_expert.alternatives.map((alt, i) => (
                      <li key={i}>
                        <span className="font-medium">
                          {EXPERT_TYPE_LABELS[alt.type] ?? alt.type}
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          — {alt.motivation}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sectie 3: Gesprekspunten */}
          <Card className="mb-6 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Gesprekspunten (Time-Out gesprek)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {task.conversation_points.map((cp, i) => (
                  <li key={i} className="rounded-lg border p-4">
                    <p className="mb-1 font-medium text-foreground">{cp.topic}</p>
                    <p className="mb-2 text-sm text-muted-foreground">Doel: {cp.goal}</p>
                    <p className="text-sm italic">Vraag voor coach: {cp.coach_prompt_question}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Knoppen */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline" asChild className="rounded-xl bg-transparent">
              <Link href="/timeout/run/demo/summary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug
              </Link>
            </Button>
            <Button
              onClick={handleSendToCoach}
              className="rounded-xl"
              size="lg"
              disabled={sendLoading}
            >
              {sendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bezig…
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Versturen naar Time-out coach
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
