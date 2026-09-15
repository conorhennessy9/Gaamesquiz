"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  ScheduleCandidate,
  ScheduleFilterOptions,
  ScheduleFilters,
  ScheduleResult,
  ScheduledRunningOrderItem,
} from "./schedule-types"
import { APPROVED_STATUS, computeEligibility, isInCooldown } from "./schedule-cooldown"

// Server actions for /admin/schedule. Reads and writes the `quiz_questions`
// table only — no per-sport gameplay table is touched, so public game
// functionality is unaffected. This is a basic scheduling system: it lets
// an admin pick a date and see which questions in the library are eligible
// to run on it, then assign/unassign that date and its running-order position.

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
  "scheduled_position",
  "monthly_category",
  "status",
].join(",")

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
    scheduled_position: number | null
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

/**
 * Approves and schedules a question onto `date`.
 *
 * Enforces server-side (never trust the disabled-button state alone):
 *  - Only approved ("verified") questions — or a question already scheduled,
 *    being moved to a different date — may be scheduled.
 *  - The target date must be outside the question's cooldown window,
 *    computed from `last_used_at + cooldown_years`.
 *
 * On success, stores `status = "scheduled"`, the `question_date`, and a
 * `scheduled_position` (append-to-end of that date's running order unless
 * an explicit position is supplied).
 */
export async function scheduleQuestion(
  id: number,
  date: string,
  position?: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase
    .from("quiz_questions")
    .select("question_date, status, last_used_at, cooldown_years")
    .eq("id", id)
    .single()

  if (fetchError || !existing) {
    return { success: false, error: fetchError?.message ?? "Question not found" }
  }

  const isAlreadyScheduled = existing.status === "scheduled" && !!existing.question_date
  if (existing.status !== APPROVED_STATUS && !isAlreadyScheduled) {
    return {
      success: false,
      error: "Only approved (verified) questions can be scheduled.",
    }
  }

  // Cooldown applies regardless of current status, unless we're just
  // keeping/reordering the question on the date it is already scheduled for.
  if (existing.question_date !== date && isInCooldown(date, existing.last_used_at, existing.cooldown_years)) {
    return {
      success: false,
      error: "This question is still in its cooldown window for that date.",
    }
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

  if (position !== undefined) {
    patch.scheduled_position = Math.max(1, Math.floor(position))
  } else if (existing.question_date !== date) {
    // Moving onto a new date (or scheduling fresh): append to the end of
    // that date's running order.
    const { data: maxRow } = await supabase
      .from("quiz_questions")
      .select("scheduled_position")
      .eq("question_date", date)
      .eq("status", "scheduled")
      .order("scheduled_position", { ascending: false })
      .limit(1)
      .maybeSingle()

    patch.scheduled_position = (maxRow?.scheduled_position ?? 0) + 1
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

  const { data: existing } = await supabase
    .from("quiz_questions")
    .select("question_date")
    .eq("id", id)
    .single()

  const { error } = await supabase
    .from("quiz_questions")
    .update({ question_date: null, status: APPROVED_STATUS, scheduled_position: null })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  if (existing?.question_date) {
    await renormalizePositions(supabase, existing.question_date)
  }

  revalidatePath("/admin/schedule")
  revalidatePath("/admin/questions")
  return { success: true }
}

/** All questions currently scheduled for `date`, in running order. */
export async function getScheduledRunningOrder(date: string): Promise<ScheduledRunningOrderItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("quiz_questions")
    .select("id, question_text, sport, game_type, scheduled_position")
    .eq("question_date", date)
    .eq("status", "scheduled")
    .order("scheduled_position", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true })

  if (error) {
    console.error("[v0] getScheduledRunningOrder error:", error)
    return []
  }

  return (data ?? []).map((row: any, index: number) => ({
    id: row.id,
    question_text: row.question_text,
    sport: row.sport,
    game_type: row.game_type,
    scheduled_position: row.scheduled_position ?? index + 1,
  }))
}

/** Swaps a scheduled question's running-order position with its neighbour. */
export async function moveScheduledPosition(
  date: string,
  id: number,
  direction: "up" | "down",
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const order = await getScheduledRunningOrder(date)
  const index = order.findIndex((item) => item.id === id)
  if (index === -1) {
    return { success: false, error: "Question is not scheduled for that date." }
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= order.length) {
    return { success: true } // already at the boundary, nothing to do
  }

  const a = order[index]
  const b = order[swapIndex]

  const [{ error: errorA }, { error: errorB }] = await Promise.all([
    supabase.from("quiz_questions").update({ scheduled_position: b.scheduled_position }).eq("id", a.id),
    supabase.from("quiz_questions").update({ scheduled_position: a.scheduled_position }).eq("id", b.id),
  ])

  if (errorA || errorB) {
    return { success: false, error: errorA?.message ?? errorB?.message }
  }

  revalidatePath("/admin/schedule")
  return { success: true }
}

/** Re-sequences scheduled_position to a clean 1..n run for the given date. */
async function renormalizePositions(supabase: Awaited<ReturnType<typeof createClient>>, date: string) {
  const { data } = await supabase
    .from("quiz_questions")
    .select("id, scheduled_position")
    .eq("question_date", date)
    .eq("status", "scheduled")
    .order("scheduled_position", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true })

  const rows = data ?? []
  await Promise.all(
    rows.map((row: any, index: number) =>
      row.scheduled_position === index + 1
        ? Promise.resolve()
        : supabase.from("quiz_questions").update({ scheduled_position: index + 1 }).eq("id", row.id),
    ),
  )
}
