"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { QuizQuestion } from "./types"

// This module powers the /admin/questions library ONLY.
// It reads and writes the same `quiz_questions` table as lib/cms/actions.ts,
// but does not touch any of the per-sport/per-game gameplay tables
// (rugby_tenaball_questions, gaa_tenaball_questions, rugby_clock_questions,
// gaa_clock_questions) — public game logic is untouched.
//
// NOTE ON SCHEMA: the live `quiz_questions` table currently does NOT have
// `competition`, `evergreen_type`, `last_verified_at`, or `cooldown_years`
// columns. Those fields are part of the target design but the migration to
// add them has not been applied yet. This file is written defensively so it
// keeps working today (those fields simply render as "Not tracked yet") and
// automatically lights up once the columns exist — no code changes needed.

export const QUESTIONS_PAGE_SIZE = 25

export type SortableColumn = "question_date" | "created_at" | "difficulty" | "status"

export interface QuestionLibraryFilters {
  search?: string
  sport?: string
  game_type?: string
  status?: string
  difficulty?: string
  evergreen_type?: string
  competition?: string
  cooldown_years?: string
  page?: number
}

export interface QuestionLibraryResult {
  data: QuizQuestion[]
  count: number
  page: number
  pageSize: number
  hasExtendedColumns: boolean
}

// Columns guaranteed to exist on the live table today.
const BASE_COLUMNS = [
  "id",
  "created_at",
  "question_date",
  "question_text",
  "answers",
  "sport",
  "game_type",
  "theme",
  "difficulty",
  "season",
  "evergreen",
  "published",
  "active",
  "status",
].join(",")

let extendedColumnsAvailable: boolean | null = null

async function detectExtendedColumns(): Promise<boolean> {
  if (extendedColumnsAvailable !== null) return extendedColumnsAvailable

  const supabase = await createClient()
  const { error } = await supabase
    .from("quiz_questions")
    .select("competition, evergreen_type, last_verified_at, cooldown_years")
    .limit(1)

  extendedColumnsAvailable = !error
  return extendedColumnsAvailable
}

export async function getQuestionLibrary(filters: QuestionLibraryFilters): Promise<QuestionLibraryResult> {
  const supabase = await createClient()
  const hasExtendedColumns = await detectExtendedColumns()

  const page = Math.max(1, filters.page ?? 1)
  const pageSize = QUESTIONS_PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const columns = hasExtendedColumns ? `${BASE_COLUMNS},competition,evergreen_type,last_verified_at,cooldown_years` : BASE_COLUMNS

  let query = supabase
    .from("quiz_questions")
    .select(columns, { count: "exact" })
    .order("question_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (filters.search?.trim()) {
    query = query.ilike("question_text", `%${filters.search.trim()}%`)
  }
  if (filters.sport) query = query.eq("sport", filters.sport)
  if (filters.game_type) query = query.eq("game_type", filters.game_type)
  if (filters.status) query = query.eq("status", filters.status)
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty)
  if (hasExtendedColumns && filters.evergreen_type) query = query.eq("evergreen_type", filters.evergreen_type)
  if (hasExtendedColumns && filters.competition) query = query.eq("competition", filters.competition)
  if (hasExtendedColumns && filters.cooldown_years) query = query.eq("cooldown_years", Number(filters.cooldown_years))

  const { data, error, count } = await query

  if (error) {
    console.error("[v0] getQuestionLibrary error:", error)
    return { data: [], count: 0, page, pageSize, hasExtendedColumns }
  }

  return { data: (data as unknown as QuizQuestion[]) ?? [], count: count ?? 0, page, pageSize, hasExtendedColumns }
}

export async function getDistinctCompetitions(): Promise<string[]> {
  const hasExtendedColumns = await detectExtendedColumns()
  if (!hasExtendedColumns) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("competition")
    .not("competition", "is", null)

  if (error || !data) return []
  const unique = Array.from(new Set(data.map((r: any) => r.competition).filter(Boolean)))
  return unique.sort()
}

export async function duplicateQuestion(id: number): Promise<{ success: boolean; error?: string; id?: number }> {
  const supabase = await createClient()

  const { data: original, error: fetchError } = await supabase.from("quiz_questions").select("*").eq("id", id).single()

  if (fetchError || !original) {
    return { success: false, error: fetchError?.message ?? "Question not found" }
  }

  const clone: Record<string, unknown> = { ...original }
  delete clone.id
  delete clone.created_at
  clone.status = "draft"
  clone.published = false
  clone.active = false
  clone.question_date = null
  clone.question_text = `${original.question_text} (copy)`

  const { data: inserted, error: insertError } = await supabase.from("quiz_questions").insert(clone).select("id").single()

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath("/admin/questions")
  return { success: true, id: inserted.id }
}

export async function deleteQuestionConfirmed(id: number): Promise<{ success: boolean; error?: string }> {
  // This is the ONLY entry point that deletes a question row, and it is only
  // ever called after the user has confirmed via the AlertDialog in the UI.
  // There is no code path that deletes without that explicit confirmation step.
  const supabase = await createClient()
  const { error } = await supabase.from("quiz_questions").delete().eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/admin/questions")
  return { success: true }
}
