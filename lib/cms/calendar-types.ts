// Plain types/constants for the /admin/calendar page. Kept out of
// calendar-actions.ts because "use server" files may only export async
// functions — no consts, types, or interfaces.

import { GAME_TYPE_OPTIONS, SPORT_OPTIONS } from "./schedule-types"

// A day is "fully populated" once it has at least one scheduled question
// for every sport × game type combination the library actually supports.
// This reuses the existing SPORT_OPTIONS / GAME_TYPE_OPTIONS constants
// rather than introducing a new quota system.
export const REQUIRED_SLOTS_PER_DAY = SPORT_OPTIONS.length * GAME_TYPE_OPTIONS.length

export type DayFillStatus = "empty" | "needs_content" | "fully_populated"

export interface CalendarDaySummary {
  date: string // yyyy-MM-dd
  count: number
  bySport: Record<string, number>
  byGameType: Record<string, number>
  filledSlots: number // distinct sport+game_type combos with >=1 question
  fillStatus: DayFillStatus
}

export interface CalendarMonthResult {
  year: number
  month: number // 1-12
  days: Record<string, CalendarDaySummary> // keyed by yyyy-MM-dd, scheduled days only
}

export interface CalendarDayQuestion {
  id: number
  question_text: string
  sport: string
  game_type: string
  competition: string | null
  theme: string | null
  difficulty: string | null
  evergreen_type: string | null
  monthly_category: string | null
  scheduled_position: number
}

export const FILL_STATUS_LABELS: Record<DayFillStatus, string> = {
  empty: "Empty",
  needs_content: "Needs content",
  fully_populated: "Fully populated",
}

export const FILL_STATUS_COLOURS: Record<DayFillStatus, string> = {
  empty: "bg-zinc-800 text-zinc-500 border border-zinc-700",
  needs_content: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  fully_populated: "bg-lime-500/20 text-lime-300 border border-lime-500/30",
}
