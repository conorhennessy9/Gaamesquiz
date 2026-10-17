// Pure validation + normalization for imported question rows. Shared by the
// client-side preview (import-parser.ts) and the server action that commits
// the import (import-actions.ts), so a row is judged by exactly the same
// rules in the preview as at insert time. Never touches the database.

import { matchPlannedCategory } from "./monthly-categories"
import {
  ANSWER_COLUMNS,
  COOLDOWN_VALUES,
  DIFFICULTY_VALUES,
  EVERGREEN_TYPE_VALUES,
  GAME_TYPE_VALUES,
  REVIEW_FREQUENCY_VALUES,
  SPORT_VALUES,
  type ImportColumn,
  type ImportIssue,
} from "./import-types"

type RowValues = Partial<Record<ImportColumn, string>>

function enumKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
}

// Friendly spreadsheet labels -> canonical database values. Keys are compared
// after stripping case, spaces, dashes and underscores.
const SPORT_ALIASES: Record<string, (typeof SPORT_VALUES)[number]> = {
  rugby: "rugby",
  rugbyunion: "rugby",
  gaa: "gaa",
}
const GAME_TYPE_ALIASES: Record<string, (typeof GAME_TYPE_VALUES)[number]> = {
  tenable: "tenable",
  tenaball: "tenable",
  againsttheclock: "against_the_clock",
  timer: "against_the_clock",
}
const DIFFICULTY_ALIASES: Record<string, (typeof DIFFICULTY_VALUES)[number]> = {
  easy: "easy",
  medium: "medium",
  hard: "hard",
  expert: "expert",
}
const EVERGREEN_TYPE_ALIASES: Record<string, (typeof EVERGREEN_TYPE_VALUES)[number]> = {
  trueevergreen: "true_evergreen",
  semievergreen: "semi_evergreen",
  snapshot: "snapshot",
  live: "live",
}
const REVIEW_FREQUENCY_ALIASES: Record<string, (typeof REVIEW_FREQUENCY_VALUES)[number]> = {
  never: "never",
  annual: "annual",
  annually: "annual",
  yearly: "annual",
  competitionend: "competition_end",
  endofcompetition: "competition_end",
  monthly: "monthly",
  manual: "manual",
}

export function normalizeSport(raw?: string) {
  return raw ? (SPORT_ALIASES[enumKey(raw)] ?? null) : null
}
export function normalizeGameType(raw?: string) {
  return raw ? (GAME_TYPE_ALIASES[enumKey(raw)] ?? null) : null
}
export function normalizeDifficulty(raw?: string) {
  return raw ? (DIFFICULTY_ALIASES[enumKey(raw)] ?? null) : null
}
export function normalizeEvergreenType(raw?: string) {
  return raw ? (EVERGREEN_TYPE_ALIASES[enumKey(raw)] ?? null) : null
}
export function normalizeReviewFrequency(raw?: string) {
  return raw ? (REVIEW_FREQUENCY_ALIASES[enumKey(raw)] ?? null) : null
}

/** Accepts "2", "2 years", "2yrs". Returns null if not one of the allowed cooldowns. */
export function normalizeCooldown(raw?: string): number | null {
  if (!raw) return null
  const match = raw.trim().toLowerCase().match(/^(\d+)\s*(y|yr|yrs|year|years)?$/)
  if (!match) return null
  const n = Number(match[1])
  return (COOLDOWN_VALUES as readonly number[]).includes(n) ? n : null
}

function isRealDate(y: number, m: number, d: number) {
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

/**
 * Accepts YYYY-MM-DD or DD/MM/YYYY (Irish/UK day-first order; "-" or "."
 * separators also allowed). Returns an ISO YYYY-MM-DD string, or null if the
 * value isn't a real calendar date.
 */
export function normalizeDate(raw?: string): string | null {
  if (!raw) return null
  const value = raw.trim()
  let y: number, m: number, d: number

  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/)
  const dayFirst = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (iso) {
    ;[y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])]
  } else if (dayFirst) {
    ;[d, m, y] = [Number(dayFirst[1]), Number(dayFirst[2]), Number(dayFirst[3])]
  } else {
    return null
  }
  if (!isRealDate(y, m, d)) return null
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function answersOf(values: RowValues): string[] {
  return ANSWER_COLUMNS.map((c) => values[c]?.trim()).filter((a): a is string => Boolean(a))
}

/** Field-level validation for one row. Duplicate detection (in-file and
 * against the library) is layered on separately by the caller. */
export function validateImportValues(values: RowValues): ImportIssue[] {
  const issues: ImportIssue[] = []

  if (!values.question?.trim()) {
    issues.push({ code: "missing_question", message: "Missing question text." })
  }

  const answers = answersOf(values)
  if (answers.length === 0) {
    issues.push({ code: "missing_answers", message: "No answers provided (answer_1 - answer_10 all empty)." })
  } else {
    const seen = new Set<string>()
    const repeated = new Set<string>()
    for (const a of answers) {
      const key = a.toLowerCase().replace(/\s+/g, " ")
      if (seen.has(key)) repeated.add(a)
      seen.add(key)
    }
    if (repeated.size > 0) {
      issues.push({
        code: "duplicate_answer",
        message: `Same answer listed more than once: ${Array.from(repeated).join(", ")}.`,
      })
    }
  }

  if (!values.sport) {
    issues.push({ code: "missing_sport", message: "Missing sport." })
  } else if (!normalizeSport(values.sport)) {
    issues.push({ code: "invalid_sport", message: `Sport "${values.sport}" must be Rugby or GAA.` })
  }

  if (!values.game_type) {
    issues.push({ code: "missing_game_type", message: "Missing game type." })
  } else if (!normalizeGameType(values.game_type)) {
    issues.push({
      code: "invalid_game_type",
      message: `Game type "${values.game_type}" must be Tenable or Timer.`,
    })
  }

  if (!values.difficulty) {
    issues.push({ code: "missing_difficulty", message: "Missing difficulty." })
  } else if (!normalizeDifficulty(values.difficulty)) {
    issues.push({
      code: "invalid_difficulty",
      message: `Difficulty "${values.difficulty}" must be one of: ${DIFFICULTY_VALUES.join(", ")}.`,
    })
  }

  if (values.evergreen_type && !normalizeEvergreenType(values.evergreen_type)) {
    issues.push({
      code: "invalid_evergreen_type",
      message: `Evergreen type "${values.evergreen_type}" must be True Evergreen, Semi Evergreen, Snapshot or Live.`,
    })
  }

  if (values.review_frequency && !normalizeReviewFrequency(values.review_frequency)) {
    issues.push({
      code: "invalid_review_frequency",
      message: `Review frequency "${values.review_frequency}" must be Never, Annual, Competition End, Monthly or Manual.`,
    })
  }

  if (values.cooldown_years && normalizeCooldown(values.cooldown_years) === null) {
    issues.push({
      code: "invalid_cooldown",
      message: `Cooldown "${values.cooldown_years}" must be ${COOLDOWN_VALUES.join(", ")} years.`,
    })
  }

  if (values.last_verified && !normalizeDate(values.last_verified)) {
    issues.push({
      code: "invalid_last_verified",
      message: `Last verified "${values.last_verified}" is not a valid date (use YYYY-MM-DD or DD/MM/YYYY).`,
    })
  }

  return issues
}

/** Builds the `quiz_questions` insert payload. Only call for rows that
 * passed `validateImportValues` with zero issues. Imports always land as
 * unpublished drafts. */
export function toQuizQuestionInsert(values: RowValues) {
  const evergreenType = normalizeEvergreenType(values.evergreen_type)
  return {
    question_text: values.question!.trim(),
    sport: normalizeSport(values.sport)!,
    game_type: normalizeGameType(values.game_type)!,
    answers: answersOf(values),
    competition: values.competition?.trim() || null,
    theme: values.theme?.trim() || null,
    monthly_category: matchPlannedCategory(normalizeSport(values.sport), values.theme),
    difficulty: normalizeDifficulty(values.difficulty)!,
    evergreen_type: evergreenType,
    evergreen: evergreenType === "true_evergreen" || evergreenType === "semi_evergreen",
    review_frequency: normalizeReviewFrequency(values.review_frequency),
    update_trigger: values.update_trigger?.trim() || null,
    last_verified_at: normalizeDate(values.last_verified),
    snapshot_period: values.snapshot_period?.trim() || null,
    cooldown_years: normalizeCooldown(values.cooldown_years),
    notes: values.notes?.trim() || null,
    status: "draft" as const,
    published: false,
  }
}
