import { z } from "zod"

export const EXPERT_TYPES = [
  "psycholoog",
  "budgetcoach",
  "mediator",
  "loopbaancoach",
  "maatschappelijk_werk",
  "slaapcoach",
  "fysiotherapeut",
  "arboarts",
  "anders",
] as const

export type ExpertType = (typeof EXPERT_TYPES)[number]

const expertMotivationSchema = z.object({
  type: z.enum(EXPERT_TYPES),
  motivation: z.string().max(240),
})

const recommendedExpertSchema = z.object({
  primary: expertMotivationSchema,
  alternatives: z.array(expertMotivationSchema).max(2),
})

const conversationPointSchema = z.object({
  topic: z.string(),
  goal: z.string(),
  coach_prompt_question: z.string(),
})

const riskFlagsSchema = z.object({
  conflict_signal: z.boolean(),
  financial_signal: z.boolean(),
  mental_overload_signal: z.boolean(),
  physical_complaints_signal: z.boolean(),
  safety_signal: z.boolean(),
})

export const taskFromSummarySchema = z.object({
  summary_public: z.string().max(500).optional(), // Opdracht in het kort; dataminimal, veilig om te tonen
  recommended_expert: recommendedExpertSchema,
  conversation_points: z
    .array(conversationPointSchema)
    .min(6)
    .max(10),
  risk_flags: riskFlagsSchema,
})

export type TaskFromSummary = z.infer<typeof taskFromSummarySchema>
export type RecommendedExpert = z.infer<typeof recommendedExpertSchema>
export type ConversationPoint = z.infer<typeof conversationPointSchema>
export type RiskFlags = z.infer<typeof riskFlagsSchema>

export const EXPERT_TYPE_LABELS: Record<string, string> = {
  psycholoog: "Psycholoog",
  budgetcoach: "Budgetcoach",
  mediator: "Mediator",
  loopbaancoach: "Loopbaancoach",
  maatschappelijk_werk: "(Bedrijfs)maatschappelijk werk",
  slaapcoach: "Slaapcoach",
  fysiotherapeut: "Fysiotherapeut",
  arboarts: "Arbo-arts",
  anders: "Anders",
}
