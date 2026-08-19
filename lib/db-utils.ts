import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { getCurrentGMTDateString } from "@/lib/date-utils"

export interface Question {
  id: string
  question: string
  answers: string[]
  date: string // GMT date string "YYYY-MM-DD"
}

export interface DailyProgress {
  date: string
  completed: boolean
  score: number
  strikes?: number
  foundAnswersList?: string[]
  timeToComplete?: number
  percentage?: number
  totalAnswersInQuestion?: number
}

export interface OverallStats {
  gamesPlayed: number
  totalCorrectAnswers: number
  totalPerfectGames?: number
  averageScore: number
  bestDailyScore: number
  currentPerfectGameStreak?: number
  longestPerfectGameStreak?: number
  lastPlayedDate: string
  completedDates: Record<string, boolean>
  totalStrikes?: number
  perfectGames?: number
  currentStreak?: number
  longestStreak?: number
  totalPossibleAnswers?: number
  averagePercentage?: number
  bestDailyPercentage?: number
}

export async function createQuestionTable() {
  // Tables are already created via SQL, this is a placeholder
  return true
}

export async function fetchQuestions(gameType: "tenable" | "clock"): Promise<Question[]> {
  const supabase = createSupabaseBrowserClient()

  let tableName = ""
  if (gameType === "tenable") {
    // For now, we'll use GAA tenable questions as example
    tableName = "gaa_tenaball_questions"
  } else {
    tableName = "gaa_clock_questions"
  }

  try {
    const { data, error } = await supabase.from(tableName).select("*").order("question_date", { ascending: true })

    if (error) {
      console.error("Error fetching questions:", error)
      return []
    }

    return data.map((q) => ({
      id: q.id.toString(),
      question: q.question_text,
      answers: q.answers,
      date: q.question_date,
    }))
  } catch (error) {
    console.error("Error fetching questions:", error)
    return []
  }
}

export async function fetchTodaysQuestion(gameType: "tenable" | "clock"): Promise<Question | null> {
  const supabase = createSupabaseBrowserClient()
  const todayDate = getCurrentGMTDateString()

  let tableName = ""
  if (gameType === "tenable") {
    tableName = "gaa_tenaball_questions"
  } else {
    tableName = "gaa_clock_questions"
  }

  try {
    const { data, error } = await supabase.from(tableName).select("*").eq("question_date", todayDate).maybeSingle()

    if (error) {
      console.error("Error fetching today's question:", error)
      return null
    }

    if (!data) return null

    return {
      id: data.id.toString(),
      question: data.question_text,
      answers: data.answers,
      date: data.question_date,
    }
  } catch (error) {
    console.error("Error fetching today's question:", error)
    return null
  }
}

export function saveDailyProgress(progress: DailyProgress[]) {
  localStorage.setItem("daily-progress-gmt", JSON.stringify(progress))
}

export function loadDailyProgress(): DailyProgress[] {
  const saved = localStorage.getItem("daily-progress-gmt")
  return saved ? JSON.parse(saved) : []
}

export function saveOverallStats(stats: OverallStats) {
  localStorage.setItem("overall-stats-gmt", JSON.stringify(stats))
}

export function loadOverallStats(): OverallStats {
  const saved = localStorage.getItem("overall-stats-gmt")
  return saved
    ? JSON.parse(saved)
    : {
        gamesPlayed: 0,
        totalCorrectAnswers: 0,
        totalPerfectGames: 0,
        averageScore: 0,
        bestDailyScore: 0,
        currentPerfectGameStreak: 0,
        longestPerfectGameStreak: 0,
        lastPlayedDate: "",
        completedDates: {},
      }
}
