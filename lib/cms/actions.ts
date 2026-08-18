"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { QuizQuestion, QuestionFormData } from "./types"

export async function getQuestions(filters?: {
  sport?: string
  game_type?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<{ data: QuizQuestion[]; count: number }> {
  const supabase = await createClient()

  let query = supabase
    .from("quiz_questions")
    .select("*", { count: "exact" })
    .order("question_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (filters?.sport) query = query.eq("sport", filters.sport)
  if (filters?.game_type) query = query.eq("game_type", filters.game_type)
  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.search) query = query.ilike("question_text", `%${filters.search}%`)
  if (filters?.limit) query = query.limit(filters.limit)
  if (filters?.offset) query = query.range(filters.offset, (filters.offset + (filters.limit ?? 20)) - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("[v0] getQuestions error:", error)
    return { data: [], count: 0 }
  }

  return { data: (data as QuizQuestion[]) ?? [], count: count ?? 0 }
}

export async function getQuestion(id: number): Promise<QuizQuestion | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data as QuizQuestion
}

export async function createQuestion(form: QuestionFormData): Promise<{ success: boolean; error?: string; id?: number }> {
  const supabase = await createClient()

  const answers = form.answers
    .map((a) => a.trim())
    .filter(Boolean)

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      question_text: form.question_text.trim(),
      answers,
      sport: form.sport,
      game_type: form.game_type,
      question_date: form.question_date || null,
      theme: form.theme?.trim() || null,
      difficulty: form.difficulty || null,
      season: form.season?.trim() || null,
      evergreen: form.evergreen ?? false,
      published: form.status === "published",
      status: form.status ?? "draft",
    })
    .select("id")
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath("/cms")
  return { success: true, id: data.id }
}

export async function updateQuestion(id: number, form: Partial<QuestionFormData>): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const updates: Record<string, unknown> = {}
  if (form.question_text !== undefined) updates.question_text = form.question_text.trim()
  if (form.answers !== undefined) updates.answers = form.answers.map((a) => a.trim()).filter(Boolean)
  if (form.sport !== undefined) updates.sport = form.sport
  if (form.game_type !== undefined) updates.game_type = form.game_type
  if (form.question_date !== undefined) updates.question_date = form.question_date || null
  if (form.theme !== undefined) updates.theme = form.theme?.trim() || null
  if (form.difficulty !== undefined) updates.difficulty = form.difficulty || null
  if (form.season !== undefined) updates.season = form.season?.trim() || null
  if (form.evergreen !== undefined) updates.evergreen = form.evergreen
  if (form.status !== undefined) {
    updates.status = form.status
    updates.published = form.status === "published"
  }

  const { error } = await supabase.from("quiz_questions").update(updates).eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/cms")
  revalidatePath(`/cms/questions/${id}`)
  return { success: true }
}

export async function deleteQuestion(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("quiz_questions").delete().eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/cms")
  return { success: true }
}

export async function publishQuestion(id: number): Promise<{ success: boolean; error?: string }> {
  return updateQuestion(id, { status: "published" })
}

export async function archiveQuestion(id: number): Promise<{ success: boolean; error?: string }> {
  return updateQuestion(id, { status: "archived" })
}

export async function bulkImport(
  rows: QuestionFormData[]
): Promise<{ success: number; errors: string[] }> {
  let success = 0
  const errors: string[] = []

  for (const row of rows) {
    const result = await createQuestion(row)
    if (result.success) success++
    else errors.push(`Row "${row.question_text?.slice(0, 40)}": ${result.error}`)
  }

  revalidatePath("/cms")
  return { success, errors }
}

export async function getStats(): Promise<{
  total: number
  published: number
  draft: number
  scheduled: number
  rugby: number
  gaa: number
}> {
  const supabase = await createClient()
  const { data } = await supabase.from("quiz_questions").select("sport, status")

  const rows = data ?? []
  return {
    total: rows.length,
    published: rows.filter((r) => r.status === "published").length,
    draft: rows.filter((r) => r.status === "draft").length,
    scheduled: rows.filter((r) => r.status === "scheduled").length,
    rugby: rows.filter((r) => r.sport === "rugby").length,
    gaa: rows.filter((r) => r.sport === "gaa").length,
  }
}

export async function getCalendarQuestions(year: number, month: number): Promise<QuizQuestion[]> {
  const supabase = await createClient()
  const from = `${year}-${String(month).padStart(2, "0")}-01`
  const to = `${year}-${String(month).padStart(2, "0")}-31`

  const { data } = await supabase
    .from("quiz_questions")
    .select("*")
    .gte("question_date", from)
    .lte("question_date", to)
    .order("question_date")

  return (data as QuizQuestion[]) ?? []
}
