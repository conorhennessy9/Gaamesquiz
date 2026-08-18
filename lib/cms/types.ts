export type Sport = "rugby" | "gaa"
export type GameType = "tenable" | "against_the_clock"
export type Difficulty = "easy" | "medium" | "hard"
export type QuestionStatus = "draft" | "scheduled" | "published" | "archived"

export interface QuizQuestion {
  id: number
  created_at: string
  question_date: string | null
  question_text: string
  answers: string[]
  sport: Sport
  game_type: GameType
  theme: string | null
  difficulty: Difficulty | null
  season: string | null
  evergreen: boolean
  published: boolean
  active: boolean
  status: QuestionStatus
}

export interface QuestionFormData {
  question_text: string
  answers: string[]
  sport: Sport
  game_type: GameType
  question_date?: string
  theme?: string
  difficulty?: Difficulty
  season?: string
  evergreen?: boolean
  status?: QuestionStatus
}

export const SPORT_LABELS: Record<Sport, string> = {
  rugby: "Rugby",
  gaa: "GAA",
}

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  tenable: "TenaBall",
  against_the_clock: "Against the Clock",
}

export const STATUS_COLOURS: Record<QuestionStatus, string> = {
  draft:     "bg-zinc-700 text-zinc-300",
  scheduled: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  published: "bg-lime-500/20 text-lime-300 border border-lime-500/30",
  archived:  "bg-red-500/20 text-red-300 border border-red-500/30",
}

// Legacy alias kept so existing code referencing CMSQuestion still compiles
export interface CMSQuestion {
  id: number
  question_text: string
  answers: string[]
  question_date: string | null
  sport: Sport
  game_type: GameType
  theme: string | null
  difficulty: Difficulty | null
  season: string | null
  evergreen: boolean
  published: boolean
  active: boolean
  status: QuestionStatus
  created_at: string
}

// Maps sport+game_type combo to the actual Supabase table name
export const TABLE_MAP: Record<Sport, Record<GameType, string>> = {
  rugby: {
    tenable: "rugby_tenaball_questions",
    against_the_clock: "rugby_against_the_clock_questions",
  },
  gaa: {
    tenable: "gaa_tenaball_questions",
    against_the_clock: "gaa_against_the_clock_questions",
  },
}

export const SPORTS: { value: Sport; label: string }[] = [
  { value: "rugby", label: "Rugby" },
  { value: "gaa", label: "GAA" },
]

export const GAME_TYPES: { value: GameType; label: string }[] = [
  { value: "tenable", label: "TenaBall" },
  { value: "against_the_clock", label: "Against The Clock" },
]

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

export const THEMES = [
  "Players",
  "Teams",
  "Stadiums",
  "History",
  "Records",
  "Trophies",
  "Provinces",
  "Internationals",
  "Clubs",
  "Managers",
  "General",
]
