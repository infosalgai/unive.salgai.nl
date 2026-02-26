"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NavHeader } from "@/components/nav-header"
import { Shield, Send, Edit, Loader2 } from "lucide-react"
import { getDemoContext } from "@/lib/demo-data"
import { useToast } from "@/hooks/use-toast"

// Mock narrative based on form data
function generateNarrative(formData: FormDataType | null): string {
  if (!formData) {
    // Default demo narrative
    return `Je hebt een time-out aangevraagd vanwege werkdruk en stress. Dit speelt al 2 tot 4 weken en je schat het risico op verzuim als behoorlijk hoog in (5 van 7).

De belangrijkste bronnen van druk zijn te veel taken en deadlines. Om de komende 1-2 weken beter door te komen, zou het helpen om prioriteiten te stellen.

Je doel voor het eerste gesprek met je time-out coach is rust en overzicht krijgen.

Op dit moment kost dit je veel energie (5 van 7). Je merkt vooral dat je minder concentratie hebt en spanning in je lijf voelt. Je hebt het minste last van je klachten als je thuis bent.

Wat betreft delen: alleen je time-out coach mag deze samenvatting zien nadat jij akkoord hebt gegeven. Er wordt geen contact opgenomen met je werkgever vóór het gesprek.`
  }

  const aanleidingLabels: Record<string, string> = {
    werkdruk: "werkdruk en stress",
    conflict: "een conflict of samenwerkingsissue",
    mantelzorg: "mantelzorgtaken",
    financieel: "financiële zorgen",
    slaap: "slaap- of energieproblemen",
    prive: "privé-omstandigheden",
    anders: formData.andersText || "een andere reden",
  }

  const sindsLabels: Record<string, string> = {
    vandaag: "vandaag of deze week",
    "2-4weken": "2 tot 4 weken",
    "1-3maanden": "1 tot 3 maanden",
    langer: "langer dan 3 maanden",
  }

  const minsteLast: Record<string, string> = {
    thuis: "thuis",
    oppad: "op pad",
    werk: "op werk",
    structuur: "bij structuur en ritme",
    gesprek: "in gesprek met iemand",
  }

  let narrative = `Je hebt een time-out aangevraagd vanwege ${aanleidingLabels[formData.aanleiding]}. Dit speelt al ${sindsLabels[formData.sinds]} en je schat het risico op verzuim als ${formData.risico <= 3 ? "beperkt" : formData.risico <= 5 ? "behoorlijk" : "hoog"} in (${formData.risico} van 7).`

  if (formData.aanvulling) {
    narrative += ` Je voegde toe: "${formData.aanvulling}"`
  }

  narrative += "\n\n"

  // Branch-specific content
  if (formData.aanleiding === "werkdruk" && formData.werkdrukDruk.length > 0) {
    narrative += `De belangrijkste bronnen van druk zijn ${formData.werkdrukDruk.join(", ").toLowerCase()}. `
    if (formData.werkdrukHelpt) {
      narrative += `Om de komende 1-2 weken beter door te komen, zou het helpen om ${formData.werkdrukHelpt.toLowerCase()}.`
    }
  } else if (formData.aanleiding === "conflict") {
    if (formData.conflictMet) {
      narrative += `Dit speelt vooral met je ${formData.conflictMet}. `
    }
    narrative += `Je voelt het ${formData.conflictVeilig <= 3 ? "niet zo veilig" : formData.conflictVeilig <= 5 ? "redelijk veilig" : "veilig"} om dit intern te bespreken. `
    if (formData.conflictDoel) {
      narrative += `Je doel is ${formData.conflictDoel.toLowerCase()}.`
    }
  } else if (formData.aanleiding === "mantelzorg") {
    narrative += `Mantelzorg vraagt ${formData.mantelzorgVraagt <= 3 ? "weinig" : formData.mantelzorgVraagt <= 5 ? "redelijk wat" : "veel"} van je (${formData.mantelzorgVraagt} van 7). `
    if (formData.mantelzorgNodig.length > 0) {
      narrative += `Van werk zou je nodig hebben: ${formData.mantelzorgNodig.join(", ").toLowerCase()}.`
    }
  } else if (formData.aanleiding === "financieel") {
    narrative += `Financiële zorgen geven je ${formData.financieelStress <= 3 ? "weinig" : formData.financieelStress <= 5 ? "matige" : "veel"} stress (${formData.financieelStress} van 7). `
    if (formData.financieelHelpt) {
      narrative += `Wat zou helpen: ${formData.financieelHelpt.toLowerCase()}.`
    }
  } else if (formData.aanleiding === "slaap") {
    if (formData.slaapMerkt.length > 0) {
      narrative += `Je merkt vooral: ${formData.slaapMerkt.join(", ").toLowerCase()}. `
    }
    if (formData.slaapHelpt) {
      narrative += `Wat verschil zou maken: ${formData.slaapHelpt.toLowerCase()}.`
    }
  } else if (formData.aanleiding === "prive") {
    if (formData.priveDelenKeuze === "ja" && formData.priveDelenText) {
      narrative += `Over je privésituatie deelde je: "${formData.priveDelenText}"`
    } else if (formData.priveDelenKeuze === "gesprek") {
      narrative += `Je wilt hierover liever tijdens het gesprek vertellen.`
    } else {
      narrative += `Je houdt de details hierover liever voor jezelf.`
    }
  }

  narrative += "\n\n"
  narrative += `Je doel voor het eerste gesprek met je time-out coach is ${formData.gesprekDoel.toLowerCase()}.`

  narrative += "\n\n"
  narrative += `Op dit moment kost dit je ${formData.energieKost <= 3 ? "weinig" : formData.energieKost <= 5 ? "redelijk wat" : "veel"} energie (${formData.energieKost} van 7). `

  if (formData.signalen.length > 0) {
    narrative += `Je merkt vooral dat je ${formData.signalen.join(", ").toLowerCase()}. `
  }

  narrative += `Je hebt het minste last van je klachten als je ${minsteLast[formData.minsteLast]} bent.`

  if (formData.signalenToelichting) {
    narrative += ` Je lichtte toe: "${formData.signalenToelichting}"`
  }

  narrative += "\n\n"
  narrative += `Wat betreft delen: `
  if (formData.delenOptie === "coach") {
    narrative += `alleen je time-out coach mag deze samenvatting zien nadat jij akkoord hebt gegeven.`
  } else {
    narrative += `naast je coach mag er ook een korte praktische terugkoppeling naar je werkgever (met jouw toestemming). `
    if (formData.werkgeverWeet === "praktisch") {
      narrative += `Je werkgever krijgt alleen praktische info over uren/taken.`
    } else if (formData.werkgeverWeet === "thema") {
      narrative += `Je werkgever krijgt het hoofdthema in 1 zin plus praktische info.`
    }
  }

  if (formData.contactWerkgever === "nee") {
    narrative += ` Er wordt geen contact opgenomen met je werkgever vóór het gesprek.`
  } else if (formData.contactWerkgever === "ja") {
    narrative += ` Je vindt het goed als er vóór het gesprek contact is met je werkgever.`
  } else {
    narrative += ` Contact met je werkgever mag pas na het gesprek.`
  }

  return narrative
}

interface FormDataType {
  aanleiding: string
  andersText: string
  sinds: string
  risico: number
  aanvulling: string
  werkdrukDruk: string[]
  werkdrukHelpt: string
  conflictMet: string
  conflictVeilig: number
  conflictDoel: string
  mantelzorgVraagt: number
  mantelzorgNodig: string[]
  financieelStress: number
  financieelHelpt: string
  slaapMerkt: string[]
  slaapHelpt: string
  priveDelenKeuze: string
  priveDelenText: string
  andersWaarover: string
  gesprekDoel: string
  energieKost: number
  signalen: string[]
  minsteLast: string
  signalenToelichting: string
  delenOptie: string
  werkgeverWeet: string
  contactWerkgever: string
}

const STORAGE_KEYS = {
  task: "timeoutTask",
  confirmedSummary: "timeoutConfirmedSummary",
  submissionId: "timeoutSubmissionId",
}

export default function TimeoutSummaryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [narrative, setNarrative] = useState("")
  const [taskLoading, setTaskLoading] = useState(false)

  useEffect(() => {
    const { role, route } = getDemoContext()
    if (!role || route !== "timeout") {
      router.push("/demo")
      return
    }

    // Generate summary via AI API
    const formDataStr = sessionStorage.getItem("timeoutFormData")
    const formData = formDataStr ? JSON.parse(formDataStr) : null

    async function fetchSummary() {
      try {
        const res = await fetch("/api/timeout/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData }),
        })
        const data = await res.json()
        const generatedNarrative = data.summary
        setNarrative(generatedNarrative)
        sessionStorage.setItem("timeoutNarrative", generatedNarrative)
      } catch {
        // Fallback to local mock
        const generatedNarrative = generateNarrative(formData)
        setNarrative(generatedNarrative)
        sessionStorage.setItem("timeoutNarrative", generatedNarrative)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummary()
  }, [router])

  const handleApprove = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmSend = async () => {
    setTaskLoading(true)
    try {
      const res = await fetch("/api/timeout/task-from-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmedSummary: narrative }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok || !data.task) {
        toast({
          variant: "destructive",
          title: "Fout",
          description: data.error ?? "Opdracht kon niet worden gegenereerd.",
        })
        return
      }
      sessionStorage.setItem(STORAGE_KEYS.task, JSON.stringify(data.task))
      sessionStorage.setItem(STORAGE_KEYS.confirmedSummary, narrative)
      sessionStorage.setItem(STORAGE_KEYS.submissionId, data.submission_id)
      setShowConfirmModal(false)
      router.push("/timeout/run/demo/coach-task")
    } catch {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Opdracht kon niet worden gegenereerd.",
      })
    } finally {
      setTaskLoading(false)
    }
  }

  const handleEdit = () => {
    router.push("/timeout/run/demo/summary-edit")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader showBack={false} />
        <main className="mx-auto max-w-[900px] px-4 py-8">
          <Card className="mx-auto max-w-2xl rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                We maken je samenvatting...
              </h2>
              <p className="text-center text-muted-foreground">
                Even geduld, we verwerken je antwoorden.
              </p>
              {/* Skeleton loaders */}
              <div className="mt-8 w-full space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-secondary" />
                <div className="h-4 w-10/12 animate-pulse rounded bg-secondary" />
                <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                <div className="h-4 w-9/12 animate-pulse rounded bg-secondary" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader showBack backHref="/timeout/run/demo/form" />

      <main className="mx-auto max-w-[900px] px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-semibold text-primary">
              Jouw samenvatting
            </h1>
            <p className="text-muted-foreground">
              Lees rustig. Jij bepaalt of dit klopt.
            </p>
          </div>

          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Vertrouwelijk – alleen jij en je time-out coach (na akkoord)
              </span>
            </div>
          </div>

          {/* Narrative card */}
          <Card className="mb-6 rounded-2xl">
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                {narrative.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed text-foreground last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="rounded-xl bg-transparent"
            >
              <Edit className="mr-2 h-4 w-4" />
              Niet akkoord: aanpassen
            </Button>
            <Button onClick={handleApprove} className="rounded-xl">
              <Send className="mr-2 h-4 w-4" />
              Ja, dit klopt, delen met time-out coach
            </Button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription className="space-y-3">
              <p>Alleen deze samenvatting wordt gedeeld met je time-out coach.</p>
              <p className="font-medium text-foreground">
                Klopt dit verhaal zoals jij het bedoelt?
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="rounded-xl"
              disabled={taskLoading}
            >
              Nog even checken
            </Button>
            <Button
              onClick={handleConfirmSend}
              className="rounded-xl"
              disabled={taskLoading}
            >
              {taskLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bezig…
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Ja, versturen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
