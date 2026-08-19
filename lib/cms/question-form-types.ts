import type { Sport, GameType } from "./types"

// Plain types/constants for the Add/Edit Question editor.
// Kept out of question-form-actions.ts because "use server" files may only
// export async functions — no consts, types, or interfaces.

// A selected answer in the editor. `id` links back to an answer_library row
// (used to bump usage_count on save); it is null for legacy free-text answers
// that don't have a matching library entry.
export interface AnswerEntry {
  id: string | null
  name: string
}

export interface QuestionFormValues {
  question_text: string
  sport: Sport | ""
  competition: string
  theme: string
  game_type: GameType | ""
  answer_entries: AnswerEntry[]
  difficulty: "easy" | "medium" | "hard" | "expert" | ""
  evergreen_type: "true_evergreen" | "semi_evergreen" | "snapshot" | "live" | ""
  review_frequency: "never" | "annual" | "competition_end" | "monthly" | "manual" | ""
  update_trigger: string
  last_verified_at: string // yyyy-MM-dd or ""
  snapshot_period: string
  notes: string
  cooldown_years: "1" | "2" | "3" | "4" | ""
  scheduled_date: string // yyyy-MM-dd or "" (stored in question_date)
  scheduled_position: string // numeric string or ""
  status: "draft" | "needs_review" | "verified" | "scheduled" | "published"
}

export const EMPTY_QUESTION_FORM: QuestionFormValues = {
  question_text: "",
  sport: "",
  competition: "",
  theme: "",
  game_type: "",
  answer_entries: [],
  difficulty: "",
  evergreen_type: "",
  review_frequency: "",
  update_trigger: "",
  last_verified_at: "",
  snapshot_period: "",
  notes: "",
  cooldown_years: "",
  scheduled_date: "",
  scheduled_position: "",
  status: "draft",
}

export interface FormOptions {
  competitions: string[]
  themes: string[]
}

export interface SaveResult {
  success: boolean
  id?: number
  error?: string
  fieldErrors?: Partial<Record<keyof QuestionFormValues, string>>
}
