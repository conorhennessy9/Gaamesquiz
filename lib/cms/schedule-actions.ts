"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ScheduleCandidate, ScheduleEligibility, ScheduleFilterOptions, ScheduleFilters, ScheduleResult } from "./schedule-types"

// Server actions for /admin/schedule. Reads and writes the `quiz_questions`
// table only — no per-sport gameplay table is touched, so public game
// functionality is unaffected. This is a basic scheduling system: it lets
// an admin pick a date and see which questions in the library are eligible
// to run on it, then assign/unassign that date.

const SCHEDULE_PAGE_SIZE = 25

const SELECT_COLUMNS = [
  "id",
  "question_text",
  "sport",
  "game_type",
  "competition",
  "theme",
  "difficulty",
  "evergreen_type",
  "cooldown_years",
  "last_used_at",
  "question_date",
  "monthly_category",
  "status",
].join(",")

function addYears(dateStr: string, years: number): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, (m ?? 1) - 1, d ?? 1)
  date.setFullYear(date.getFullYear() + years)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yy}-${mm}-${dd}`
}

function computeEligibility(
  row: {
    question_date: string | null
    status: string
    last_used_at: string | null
    cooldown_years: number | null
  },
  targetDate: string,
): { eligibility: ScheduleEligibility; cooldownUntil: string | null } {
  if (row.question_date === targetDate) {
    return { eligibility: "scheduled_this_date", cooldownUntil: null }
  }

  if (row.question_date && row.status === "scheduled") {
    return { eligibility: "scheduled_other_date", cooldownUntil: null }
  }

  if (row.status === "published" || row.status === "archived") {
    return { eligibility: "not_schedulable_status", cooldownUntil: null }
  }

  if (row.last_used_at && row.cooldown_years) {
    const cooldownUntil = addYears(row.last_used_at, row.cooldown_years)
    if (targetDate < cooldownUntil) {
      return { eligibility: "cooldown", cooldownUntil }
    }
  }

  return { eligibility: "eligible", cooldownUntil: null }
}

export async function getScheduleCandidates(filters: ScheduleFilters): Promise<ScheduleResult> {
  const supabase = await createClient()

  const page = Math.max(1, filters.page ?? 1)
  const pageSize = SCHEDULE_PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("quiz_questions")
    .select(SELECT_COLUMNS, { count: "exact" })
    .order("question_date", { ascending: true, nullsFirst: true })
    .order("id", { ascending: true })
    .range(from, to)

  if (filters.sport) query = query.eq("sport", filters.sport)
  if (filters.competition) query = query.eq("competition", filters.competition)
  if (filters.theme) query = query.eq("theme", filters.theme)
  if (filters.game_type) query = query.eq("game_type", filters.game_type)
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty)
  if (filters.evergreen_type) query = query.eq("evergreen_type", filters.evergreen_type)
  if (filters.cooldown_years) query = query.eq("cooldown_years", Number(filters.cooldown_years))
  if (filters.monthly_category) query = query.eq("monthly_category", filters.monthly_category)
  if (filters.status) query = query.eq("status", filters.status)

  const { data, error, count } = await query

  if (error) {
    console.error("[v0] getScheduleCandidates error:", error)
    return { data: [], count: 0, page, pageSize }
  }

  const rows = (data ?? []) as unknown as Array<{
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
    monthly_category: string | null
    status: string
  }>

  const candidates: ScheduleCandidate[] = rows.map((row) => {
    const { eligibility, cooldownUntil } = computeEligibility(row, filters.date)
    return { ...row, eligibility, cooldownUntil }
  })

  return { data: candidates, count: count ?? 0, page, pageSize }
}

export async function getScheduleFilterOptions(): Promise<ScheduleFilterOptions> {
  const supabase = await createClient()

  const [competitionRes, themeRes, categoryRes] = await Promise.all([
    supabase.from("quiz_questions").select("competition").not("competition", "is", null),
    supabase.from("quiz_questions").select("theme").not("theme", "is", null),
    supabase.from("quiz_questions").select("monthly_category").not("monthly_category", "is", null),
  ])

  const competitions = Array.from(new Set((competitionRes.data ?? []).map((r: any) => r.competition as string))).sort()
  const themes = Array.from(new Set((themeRes.data ?? []).map((r: any) => r.theme as string))).sort()
  const monthlyCategories = Array.from(
    new Set((categoryRes.data ?? []).map((r: any) => r.monthly_category as string)),
  ).sort()

  return { competitions, themes, monthlyCategories }
}

export async function scheduleQuestion(
  id: number,
  date: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase
    .from("quiz_questions")
    .select("question_date")
    .eq("id", id)
    .single()

  if (fetchError || !existing) {
    return { success: false, error: fetchError?.message ?? "Question not found" }
  }

  const today = new Date().toISOString().slice(0, 10)
  const patch: Record<string, unknown> = {
    question_date: date,
    status: "scheduled",
  }

  // If this question previously ran on a past date, preserve that as its
  // "previous usage" record before overwriting question_date with the new
  // scheduled date, so cooldown checks stay accurate.
  if (existing.question_date && existing.question_date !== date && existing.question_date < today) {
    patch.last_used_at = existing.question_date
  }

  const { error } = await supabase.from("quiz_questions").update(patch).eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/schedule")
  revalidatePath("/admin/questions")
  return { success: true }
}

export async function unscheduleQuestion(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("quiz_questions")
    .update({ question_date: null, status: "draft" })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/schedule")
  revalidatePath("/admin/questions")
  return { success: true }
}
