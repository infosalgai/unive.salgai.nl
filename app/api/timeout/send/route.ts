import { NextResponse } from "next/server"

export const runtime = "nodejs"

const CACHE_HEADERS = {
  "Cache-Control": "no-store",
}

/** Stub: later vervangen door adapter naar formiq.nl of klant systeem. Geen payload logging. */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const submission_id = typeof body?.submission_id === "string" ? body.submission_id.trim() : ""
    const task = body?.task

    if (!submission_id || !task) {
      return NextResponse.json(
        { error: "submission_id en task zijn verplicht", ok: false },
        { status: 400, headers: CACHE_HEADERS }
      )
    }

    // Stub: geen externe delivery, geen logging
    return NextResponse.json(
      { ok: true },
      { headers: CACHE_HEADERS }
    )
  } catch {
    return NextResponse.json(
      { error: "Versturen mislukt.", ok: false },
      { status: 500, headers: CACHE_HEADERS }
    )
  }
}
