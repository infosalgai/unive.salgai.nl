import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { generateTaskFromSummary } from "@/lib/task/generateTaskFromSummary"

export const runtime = "nodejs"

const CACHE_HEADERS = {
  "Cache-Control": "no-store",
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const confirmedSummary = typeof body?.confirmedSummary === "string" ? body.confirmedSummary.trim() : ""

    if (!confirmedSummary) {
      return NextResponse.json(
        { error: "confirmedSummary is verplicht", ok: false },
        { status: 400, headers: CACHE_HEADERS }
      )
    }

    const result = await generateTaskFromSummary(confirmedSummary)

    if ("error" in result) {
      console.error("task-from-summary error:", result.error)
      return NextResponse.json(
        { error: "Opdracht kon niet worden gegenereerd.", ok: false },
        { status: 500, headers: CACHE_HEADERS }
      )
    }

    const submission_id = randomUUID()

    return NextResponse.json(
      { task: result.task, submission_id, ok: true },
      { headers: CACHE_HEADERS }
    )
  } catch {
    return NextResponse.json(
      { error: "Opdracht kon niet worden gegenereerd.", ok: false },
      { status: 500, headers: CACHE_HEADERS }
    )
  }
}
