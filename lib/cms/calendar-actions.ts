"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { CalendarDayQuestion, CalendarDaySummary, CalendarMonthResult, DayFillStatus } from "./calendar-types"
import { REQUIRED_SLOTS_PER_DAY } from "./calendar-types"
import { APPROVED_STATUS, isInCooldown } from "./schedule-cooldown"

// Server actions for /admin/calendar. Reads and writes the same
// `quiz_questions` table the scheduler uses — no new table, no separate
// category system. A day's "fill status" is derived from how many distinct
// sport + game_type combinations already have a scheduled question, reusing
// the SPORT_OPTIONS / GAME_TYPE_OPTIONS constants from schedule-types.ts.

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

function monthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${pad(month)}-01`
  const lastDay = new Date(year, month, 0).getDate() // day 0 of next month = last day of this month
  const end = `${year}-${pad(month)}-${pad(lastDay)}`
  return { start, end }
}

function fillStatusFor(filledSlots: number, count: number): DayFillStatus {
  if (count === 0) return "empty"
  if (filledSlots >= REQUIRED_SLOTS_PER_DAY) return "fully_populated"
  return "needs_content"
}

/** Scheduled-question summary for every day in a given month. */
export async function getCalendarMonth(year: number, month: number): Promise<CalendarMonthResult> {
  const supabase = await createClient()
  const { start, end } = monthRange(year, month)

  const { data, error } = await supabase
    .from("quiz_questions")
    .select("question_date, sport, game_type")
    .eq("status", "scheduled")
    .gte("question_date", start)
    .lte("question_date", end)

  if (error) {
    console.error("[v0] getCalendarMonth error:", error)
    return { year, month, days: {} }
  }

  const days: Record<string, CalendarDaySummary> = {}

  for (const row of (data ?? []) as Array<{ question_date: string; sport: string; game_type: string }>) {
    const date = row.question_date
    if (!days[date]) {
      days[date] = { date, count: 0, bySport: {}, byGameType: {}, filledSlots: 0, fillStatus: "empty" }
    }
    const day = days[date]
    day.count += 1
    day.bySport[row.sport] = (day.bySport[row.sport] ?? 0) + 1
    day.byGameType[row.game_type] = (day.byGameType[row.game_type] ?? 0) + 1
  }

  for (const date of Object.keys(days)) {
    const day = days[date]
    const combos = new Set<string>()
    // Recompute distinct sport+game_type combos from the raw rows for this date.
    for (const row of (data ?? []) as Array<{ question_date: string; sport: string; game_type: string }>) {
      if (row.question_date === date) combos.add(`${row.sport}::${row.game_type}`)
    }
    day.filledSlots = combos.size
    day.fillStatus = fillStatusFor(day.filledSlots, day.count)
  }

  return { year, month, days }
}

/** All questions scheduled for a single day, in running order. */
export async function getCalendarDayQuestions(date: string): Promise<CalendarDayQuestion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("quiz_questions")
    .select(
      "id, question_text, sport, game_type, competition, theme, difficulty, evergreen_type, monthly_category, scheduled_position",
    )
    .eq("question_date", date)
    .eq("status", "scheduled")
    .order("scheduled_position", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true })

  if (error) {
    console.error("[v0] getCalendarDayQuestions error:", error)
    return []
  }

  return (data ?? []).map((row: any, index: number) => ({
    ...row,
    scheduled_position: row.scheduled_position ?? index + 1,
  }))
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

/**
 * Moves a scheduled question from its current day onto a different day.
 * Enforces the same cooldown rule as the scheduler — never trust the
 * disabled-button state on the client alone.
 */
export async function moveCalendarQuestion(
  id: number,
  toDate: string,
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

  if (existing.status !== "scheduled" || !existing.question_date) {
    return { success: false, error: "Question is not currently scheduled." }
  }

  const fromDate = existing.question_date
  if (fromDate === toDate) {
    return { success: true }
  }

  if (isInCooldown(toDate, existing.last_used_at, existing.cooldown_years)) {
    return { success: false, error: "This question is still in its cooldown window for that date." }
  }

  const { data: maxRow } = await supabase
    .from("quiz_questions")
    .select("scheduled_position")
    .eq("question_date", toDate)
    .eq("status", "scheduled")
    .order("scheduled_position", { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextPosition = (maxRow?.scheduled_position ?? 0) + 1

  const { error } = await supabase
    .from("quiz_questions")
    .update({ question_date: toDate, scheduled_position: nextPosition })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  await renormalizePositions(supabase, fromDate)

  revalidatePath("/admin/calendar")
  revalidatePath("/admin/schedule")
  revalidatePath("/admin/questions")
  return { success: true }
}

/**
 * Removes a question from the calendar: clears its scheduled date/position
 * and returns it to "verified" (approved, unscheduled) status. This never
 * deletes the question itself — only unschedules it.
 */
export async function removeCalendarQuestion(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: existing } = await supabase.from("quiz_questions").select("question_date").eq("id", id).single()

  const { error } = await supabase
    .from("quiz_questions")
    .update({ question_date: null, scheduled_position: null, status: APPROVED_STATUS })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  if (existing?.question_date) {
    await renormalizePositions(supabase, existing.question_date)
  }

  revalidatePath("/admin/calendar")
  revalidatePath("/admin/schedule")
  revalidatePath("/admin/questions")
  return { success: true }
}
