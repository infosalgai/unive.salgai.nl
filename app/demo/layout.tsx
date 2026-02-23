import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Demo – Time-out & Navigatiegesprek | Mensgericht Casemanagement",
  description:
    "Probeer de demo van de Mensgericht Casemanagement Toolkit. Kies een rol (medewerker, coach, HR of leidinggevende) en ervaar de Time-out intake of het Navigatiegesprek. Onderdeel van Verzuimdynamiek & Salgai.",
  openGraph: {
    title: "Demo – Time-out & Navigatiegesprek | Mensgericht Casemanagement",
    description:
      "Probeer de demo van de Mensgericht Casemanagement Toolkit. Kies een rol (medewerker, coach, HR of leidinggevende) en ervaar de Time-out of het Navigatiegesprek.",
    type: "website",
    locale: "nl_NL",
  },
}

export default function DemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
