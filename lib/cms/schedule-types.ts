// Plain types/constants for the /admin/schedule page. Kept out of
// schedule-actions.ts because "use server" files may only export async
// functions — no consts, types, or interfaces.

export interface ScheduleFilters {
  date: string // yyyy-MM-dd — the date being scheduled for
  sport?: string
  competition?: string
  theme?: string
  game_type?: string
  difficulty?: string
  evergreen_type?: string
  cooldown_years?: string
  monthly_category?: string
  status?: string
  page?: number
}

export type ScheduleEligibility =
  | "eligible"
  | "cooldown"
  | "scheduled_this_date"
  | "scheduled_other_date"
  | "not_schedulable_status"

export interface ScheduleCandidate {
  id: number
  question_text: string
  sport: string
  game_type: string
  competition: string | null
  theme: string | null
  difficulty: string | null
  evergreen_type: string | null
  cooldown_years: number | null
  last_used_at: string | null
  question_date: string | null
  scheduled_position: number | null
  monthly_category: string | null
  status: string
  eligibility: ScheduleEligibility
  cooldownUntil: string | null
}

export interface ScheduledRunningOrderItem {
  id: number
  question_text: string
  sport: string
  game_type: string
  scheduled_position: number
}

export interface ScheduleFilterOptions {
  competitions: string[]
  themes: string[]
  monthlyCategories: string[]
}

export interface ScheduleResult {
  data: ScheduleCandidate[]
  count: number
  page: number
  pageSize: number
}

export const ELIGIBILITY_LABELS: Record<ScheduleEligibility, string> = {
  eligible: "Eligible",
  cooldown: "In cooldown",
  scheduled_this_date: "Scheduled for this date",
  scheduled_other_date: "Scheduled elsewhere",
  not_schedulable_status: "Not schedulable",
}

export const ELIGIBILITY_COLOURS: Record<ScheduleEligibility, string> = {
  eligible: "bg-lime-500/20 text-lime-300 border border-lime-500/30",
  cooldown: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  scheduled_this_date: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  scheduled_other_date: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  not_schedulable_status: "bg-zinc-700 text-zinc-400 border border-zinc-600",
}

export const SPORT_OPTIONS = [
  { value: "rugby", label: "Rugby" },
  { value: "gaa", label: "GAA" },
]

export const GAME_TYPE_OPTIONS = [
  { value: "tenable", label: "TenaBall" },
  { value: "against_the_clock", label: "Against the Clock" },
]

export const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
]

export const EVERGREEN_TYPE_OPTIONS = [
  { value: "true_evergreen", label: "True Evergreen" },
  { value: "semi_evergreen", label: "Semi-Evergreen" },
  { value: "snapshot", label: "Snapshot" },
  { value: "live", label: "Live" },
]

export const COOLDOWN_OPTIONS = [
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "4", label: "4 years" },
]

export const QUESTION_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "needs_review", label: "Needs Review" },
  { value: "verified", label: "Verified" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
]
