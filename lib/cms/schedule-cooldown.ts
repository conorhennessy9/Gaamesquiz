// Pure, framework-free scheduling logic: cooldown math + eligibility rules.
// Kept out of schedule-actions.ts (a "use server" file, which may only
// export async functions) so it can be unit-tested directly and shared
// between the server actions and any test script.

import type { ScheduleEligibility } from "./schedule-types"

// The only status that represents an "approved" question. Only approved
// questions may be scheduled — this is what "when approved -> scheduled"
// means in practice.
export const APPROVED_STATUS = "verified"

export const VALID_COOLDOWN_YEARS = [1, 2, 3, 4] as const

/**
 * Adds `years` whole years to a yyyy-MM-dd date string, returning a new
 * yyyy-MM-dd string. Pure date-math, no timezone conversion — operates on
 * the calendar date only.
 */
export function addYears(dateStr: string, years: number): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, (m ?? 1) - 1, d ?? 1)
  date.setFullYear(date.getFullYear() + years)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yy}-${mm}-${dd}`
}

/**
 * The date on/after which a question is out of cooldown, or null if it
 * has never been used or has no cooldown configured.
 *
 * Example: last used 2027-01-12 with a 3 year cooldown -> "2030-01-12".
 * The question must NOT be suggested/scheduled before that date.
 */
export function getCooldownUntil(lastUsedAt: string | null, cooldownYears: number | null): string | null {
  if (!lastUsedAt || !cooldownYears) return null
  return addYears(lastUsedAt, cooldownYears)
}

/** True if `targetDate` falls before the question's cooldown clears. */
export function isInCooldown(
  targetDate: string,
  lastUsedAt: string | null,
  cooldownYears: number | null,
): boolean {
  const cooldownUntil = getCooldownUntil(lastUsedAt, cooldownYears)
  if (!cooldownUntil) return false
  return targetDate < cooldownUntil
}

export interface EligibilityInput {
  question_date: string | null
  status: string
  last_used_at: string | null
  cooldown_years: number | null
}

export interface EligibilityResult {
  eligibility: ScheduleEligibility
  cooldownUntil: string | null
}

/**
 * Decides whether a question can be scheduled onto `targetDate`, in this
 * priority order:
 *  1. Already scheduled for this exact date -> "scheduled_this_date"
 *  2. Scheduled for a different date -> "scheduled_other_date"
 *  3. Not approved (status !== "verified") -> "not_schedulable_status"
 *  4. Still inside its cooldown window -> "cooldown"
 *  5. Otherwise -> "eligible"
 */
export function computeEligibility(row: EligibilityInput, targetDate: string): EligibilityResult {
  if (row.status === "scheduled" && row.question_date === targetDate) {
    return { eligibility: "scheduled_this_date", cooldownUntil: null }
  }

  if (row.status === "scheduled" && row.question_date) {
    return { eligibility: "scheduled_other_date", cooldownUntil: null }
  }

  if (row.status !== APPROVED_STATUS) {
    return { eligibility: "not_schedulable_status", cooldownUntil: null }
  }

  if (isInCooldown(targetDate, row.last_used_at, row.cooldown_years)) {
    return { eligibility: "cooldown", cooldownUntil: getCooldownUntil(row.last_used_at, row.cooldown_years) }
  }

  return { eligibility: "eligible", cooldownUntil: null }
}
