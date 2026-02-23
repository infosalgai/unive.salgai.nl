// Demo data for Navigatiegesprek prototype
// All dates are static strings to avoid Date.now()

/** Rol in de demo. HR en Leidinggevende zijn gescheiden (RBAC + eigen dashboards). */
export type DemoRole = "medewerker" | "coach" | "hr" | "manager"
export type DemoRoute = "timeout" | "navigation"

// Demo context helpers
export function getDemoContext(): { role: DemoRole | null; route: DemoRoute | null } {
  if (typeof window === "undefined") {
    return { role: null, route: null }
  }
  const role = localStorage.getItem("demoRole") as DemoRole | null
  const route = localStorage.getItem("demoRoute") as DemoRoute | null
  return { role, route }
}

const DEMO_ROLE_COOKIE = "demoRole"

export function setDemoContext({ role, route }: { role?: DemoRole; route?: DemoRoute }) {
  if (typeof window === "undefined") return
  if (role) {
    localStorage.setItem("demoRole", role)
    document.cookie = `${DEMO_ROLE_COOKIE}=${encodeURIComponent(role)};path=/;max-age=86400;samesite=lax`
  }
  if (route) localStorage.setItem("demoRoute", route)
}

export function clearDemoContext() {
  if (typeof window === "undefined") return
  localStorage.removeItem("demoRole")
  localStorage.removeItem("demoRoute")
  document.cookie = `${DEMO_ROLE_COOKIE}=;path=/;max-age=0`
}

// Route configuration
export const ROUTE_CONFIG: Record<DemoRoute, { label: string; shortLabel: string; description: string }> = {
  timeout: { 
    label: "Time-out", 
    shortLabel: "Time-out",
    description: "Preventief, vóór verzuim. Intake + samenvatting (demo)." 
  },
  navigation: { 
    label: "Navigatiegesprek", 
    shortLabel: "Navigatie",
    description: "Situatie ordenen en samenvatten voor de navigatiecoach (demo)." 
  },
}

export type RequestStatus = 
  | "concept" 
  | "samenvatting_klaar" 
  | "wacht_op_toestemming" 
  | "toestemming_gegeven"
  | "gedeeld_met_coach"
  | "lopend"
  | "afgerond"
  | "geweigerd"
  | "ingetrokken"

export interface EmployeeRequest {
  id: string
  status: RequestStatus
  createdDate: string
  updatedDate: string
  coachName?: string
}

export interface CoachRequest {
  id: string
  status: RequestStatus
  createdDate: string
  updatedDate: string
  employeeCode: string // anonymized identifier
  hasSummaryAccess: boolean
}

export interface HRStats {
  totalRequests30Days: number
  uniqueEmployees: number
  sharedWithCoach: number
  avgDaysToApproval: number
  requestsPerWeek: { week: string; count: number }[]
  approvalFunnel: { step: string; count: number; percentage: number }[]
  topThemes: { theme: string; count: number }[]
}

// Employee requests (what the employee sees)
export const employeeRequests: EmployeeRequest[] = [
  {
    id: "NAV-2026-001",
    status: "gedeeld_met_coach",
    createdDate: "15-01-2026",
    updatedDate: "18-01-2026",
    coachName: "Marieke van der Berg",
  },
  {
    id: "NAV-2026-004",
    status: "samenvatting_klaar",
    createdDate: "28-01-2026",
    updatedDate: "30-01-2026",
  },
  {
    id: "NAV-2026-005",
    status: "concept",
    createdDate: "01-02-2026",
    updatedDate: "01-02-2026",
  },
]

// Coach requests (what the coach sees)
export const coachRequests: CoachRequest[] = [
  {
    id: "NAV-2026-001",
    status: "gedeeld_met_coach",
    createdDate: "15-01-2026",
    updatedDate: "18-01-2026",
    employeeCode: "MW-7821",
    hasSummaryAccess: true,
  },
  {
    id: "NAV-2026-002",
    status: "wacht_op_toestemming",
    createdDate: "20-01-2026",
    updatedDate: "22-01-2026",
    employeeCode: "MW-4532",
    hasSummaryAccess: false,
  },
  {
    id: "NAV-2026-003",
    status: "toestemming_gegeven",
    createdDate: "22-01-2026",
    updatedDate: "25-01-2026",
    employeeCode: "MW-9104",
    hasSummaryAccess: true,
  },
  {
    id: "NAV-2026-006",
    status: "lopend",
    createdDate: "25-01-2026",
    updatedDate: "30-01-2026",
    employeeCode: "MW-2287",
    hasSummaryAccess: true,
  },
  {
    id: "NAV-2026-007",
    status: "afgerond",
    createdDate: "10-01-2026",
    updatedDate: "28-01-2026",
    employeeCode: "MW-5561",
    hasSummaryAccess: true,
  },
  {
    id: "NAV-2026-008",
    status: "geweigerd",
    createdDate: "18-01-2026",
    updatedDate: "20-01-2026",
    employeeCode: "MW-3349",
    hasSummaryAccess: false,
  },
  {
    id: "NAV-2026-009",
    status: "wacht_op_toestemming",
    createdDate: "29-01-2026",
    updatedDate: "29-01-2026",
    employeeCode: "MW-8876",
    hasSummaryAccess: false,
  },
  {
    id: "NAV-2026-010",
    status: "ingetrokken",
    createdDate: "12-01-2026",
    updatedDate: "26-01-2026",
    employeeCode: "MW-1123",
    hasSummaryAccess: false,
  },
]

// HR statistics (anonymized)
export const hrStats: HRStats = {
  totalRequests30Days: 24,
  uniqueEmployees: 19,
  sharedWithCoach: 14,
  avgDaysToApproval: 2.3,
  requestsPerWeek: [
    { week: "Week 1", count: 5 },
    { week: "Week 2", count: 7 },
    { week: "Week 3", count: 6 },
    { week: "Week 4", count: 6 },
  ],
  approvalFunnel: [
    { step: "Gestart", count: 24, percentage: 100 },
    { step: "Samenvatting gemaakt", count: 21, percentage: 88 },
    { step: "Akkoord gegeven", count: 16, percentage: 67 },
    { step: "Gedeeld met coach", count: 14, percentage: 58 },
  ],
  topThemes: [
    { theme: "Werkdruk", count: 8 },
    { theme: "Privé-omstandigheden", count: 6 },
    { theme: "Samenwerking", count: 5 },
    { theme: "Energie-balans", count: 5 },
  ],
}

/** Leidinggevende: alleen team-scope, procesniveau (geen inhoudelijke/medische details). */
export interface ManagerTeamStats {
  teamLabel: string
  ongoingTrajecten: number
  statusOverzicht: { status: string; count: number }[]
  volgendeActies: { label: string; count: number }[]
}

export const managerTeamStats: ManagerTeamStats = {
  teamLabel: "Mijn team (demo)",
  ongoingTrajecten: 3,
  statusOverzicht: [
    { status: "Time-out aangevraagd", count: 1 },
    { status: "In gesprek met coach", count: 2 },
    { status: "Afgerond (30 dagen)", count: 4 },
  ],
  volgendeActies: [
    { label: "Plan gesprek inplannen", count: 1 },
    { label: "Geen actie", count: 6 },
  ],
}

// Status configuration for UI display
export const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string }> = {
  concept: { label: "Concept", color: "bg-secondary text-secondary-foreground" },
  samenvatting_klaar: { label: "Samenvatting klaar", color: "bg-accent/20 text-accent" },
  wacht_op_toestemming: { label: "Wacht op toestemming", color: "bg-amber-100 text-amber-700" },
  toestemming_gegeven: { label: "Toestemming gegeven", color: "bg-emerald-100 text-emerald-700" },
  gedeeld_met_coach: { label: "Gedeeld met coach", color: "bg-primary/10 text-primary" },
  lopend: { label: "Lopend", color: "bg-blue-100 text-blue-700" },
  afgerond: { label: "Afgerond", color: "bg-slate-100 text-slate-600" },
  geweigerd: { label: "Geweigerd", color: "bg-red-100 text-red-700" },
  ingetrokken: { label: "Ingetrokken", color: "bg-red-100 text-red-700" },
}

// Role configuration (RBAC: HR = organisatiebreed geanonimiseerd, manager = alleen team/procesniveau)
export const ROLE_CONFIG: Record<DemoRole, { label: string; tooltip: string }> = {
  medewerker: { label: "Medewerker", tooltip: "Jij houdt regie" },
  coach: { label: "Coach", tooltip: "Alleen na toestemming" },
  hr: { label: "HR", tooltip: "Alleen geanonimiseerde data, geen medische details" },
  manager: { label: "Leidinggevende", tooltip: "Alleen team-scope, status/proces, geen inhoudelijke antwoorden" },
}
