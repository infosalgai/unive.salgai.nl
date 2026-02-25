import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DemoAccessForm } from "./DemoAccessForm"

const DEMO_ACCESS_COOKIE = "demo_access"

type Props = {
  searchParams: Promise<{ next?: string; reset?: string }>
}

export default async function DemoAccessPage({ searchParams }: Props) {
  const params = await searchParams
  const next = params.next ?? "/demo"

  if (params.reset === "1") {
    const cookieStore = await cookies()
    cookieStore.delete(DEMO_ACCESS_COOKIE)
    redirect(`/demo/access${next !== "/demo" ? `?next=${encodeURIComponent(next)}` : ""}`)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <DemoAccessForm next={next} />
    </div>
  )
}
