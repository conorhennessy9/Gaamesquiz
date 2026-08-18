"use server"

import { createClient } from "@/lib/supabase/server"

export interface AnswerSuggestion {
  id: number
  answer: string
  usage_count: number
  category?: string
}

/**
 * Search GAA answers — pulls from both the answer bank table AND all historical
 * question answers so the dropdown is always populated even if the bank trigger
 * hasn't run yet for recent uploads.
 */
export async function searchGAAAnswers(query: string, limit = 10): Promise<AnswerSuggestion[]> {
  if (!query || query.trim().length < 1) return []

  const supabase = await createClient()
  const q = query.trim()

  // Pull from answer bank (has usage_count for ranking)
  const { data: bankData } = await supabase
    .from("gaa_answer_bank")
    .select("id, answer, usage_count, category")
    .ilike("answer", `%${q}%`)
    .order("usage_count", { ascending: false })
    .order("answer", { ascending: true })
    .limit(limit)

  // Also pull directly from all historical question answers so nothing is missed
  const { data: questionsData } = await supabase
    .from("gaa_tenaball_questions")
    .select("answers")
  const { data: clockData } = await supabase
    .from("gaa_clock_questions")
    .select("answers")

  // Flatten all historical answers and filter by query
  const allHistorical: string[] = []
  for (const row of [...(questionsData ?? []), ...(clockData ?? [])]) {
    if (Array.isArray(row.answers)) allHistorical.push(...row.answers)
  }
  const uniqueHistorical = [...new Set(allHistorical)]
    .filter((a) => a.toLowerCase().includes(q.toLowerCase()))
    .slice(0, limit)

  // Merge: bank entries first (with usage_count), then historical extras not already in bank
  const bankAnswers = (bankData ?? []) as AnswerSuggestion[]
  const bankSet = new Set(bankAnswers.map((b) => b.answer.toLowerCase()))
  const extras: AnswerSuggestion[] = uniqueHistorical
    .filter((a) => !bankSet.has(a.toLowerCase()))
    .map((a, i) => ({ id: -(i + 1), answer: a, usage_count: 1 }))

  return [...bankAnswers, ...extras].slice(0, limit)
}

/**
 * Search Rugby answers — pulls from both the answer bank table AND all historical
 * question answers so the dropdown is always populated even if the bank trigger
 * hasn't run yet for recent uploads.
 */
export async function searchRugbyAnswers(query: string, limit = 10): Promise<AnswerSuggestion[]> {
  if (!query || query.trim().length < 1) return []

  const supabase = await createClient()
  const q = query.trim()

  // Pull from answer bank (has usage_count for ranking)
  const { data: bankData } = await supabase
    .from("rugby_answer_bank")
    .select("id, answer, usage_count, category")
    .ilike("answer", `%${q}%`)
    .order("usage_count", { ascending: false })
    .order("answer", { ascending: true })
    .limit(limit)

  // Also pull directly from all historical question answers so nothing is missed
  const { data: questionsData } = await supabase
    .from("rugby_tenaball_questions")
    .select("answers")
  const { data: clockData } = await supabase
    .from("rugby_clock_questions")
    .select("answers")

  const allHistorical: string[] = []
  for (const row of [...(questionsData ?? []), ...(clockData ?? [])]) {
    if (Array.isArray(row.answers)) allHistorical.push(...row.answers)
  }
  const uniqueHistorical = [...new Set(allHistorical)]
    .filter((a) => a.toLowerCase().includes(q.toLowerCase()))
    .slice(0, limit)

  const bankAnswers = (bankData ?? []) as AnswerSuggestion[]
  const bankSet = new Set(bankAnswers.map((b) => b.answer.toLowerCase()))
  const extras: AnswerSuggestion[] = uniqueHistorical
    .filter((a) => !bankSet.has(a.toLowerCase()))
    .map((a, i) => ({ id: -(i + 1), answer: a, usage_count: 1 }))

  return [...bankAnswers, ...extras].slice(0, limit)
}

/**
 * Get popular answers from GAA answer bank
 */
export async function getPopularGAAAnswers(
  limit = 20
): Promise<AnswerSuggestion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("gaa_answer_bank")
    .select("id, answer, usage_count, category")
    .order("usage_count", { ascending: false })
    .order("answer", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching popular GAA answers:", error)
    return []
  }

  return data || []
}

/**
 * Get popular answers from Rugby answer bank
 */
export async function getPopularRugbyAnswers(
  limit = 20
): Promise<AnswerSuggestion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("rugby_answer_bank")
    .select("id, answer, usage_count, category")
    .order("usage_count", { ascending: false })
    .order("answer", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching popular Rugby answers:", error)
    return []
  }

  return data || []
}

/**
 * Add a new answer to the GAA answer bank
 */
export async function addGAAAnswer(
  answer: string,
  category?: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("gaa_answer_bank")
    .upsert(
      {
        answer: answer.trim(),
        category: category || "general",
        usage_count: 1,
      },
      {
        onConflict: "answer",
        ignoreDuplicates: false,
      }
    )

  if (error) {
    console.error("[v0] Error adding GAA answer:", error)
    return false
  }

  return true
}

/**
 * Add a new answer to the Rugby answer bank
 */
export async function addRugbyAnswer(
  answer: string,
  category?: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("rugby_answer_bank")
    .upsert(
      {
        answer: answer.trim(),
        category: category || "general",
        usage_count: 1,
      },
      {
        onConflict: "answer",
        ignoreDuplicates: false,
      }
    )

  if (error) {
    console.error("[v0] Error adding Rugby answer:", error)
    return false
  }

  return true
}
