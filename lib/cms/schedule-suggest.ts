// Pure scoring for schedule suggestions. Suggestions are advisory only:
// nothing here writes to the database. An admin adds suggestions to a
// draft and explicitly approves it before anything is scheduled.

import { getCooldownUntil } from "./schedule-cooldown"
import { categoryForDate, matchPlannedCategory } from "./monthly-categories"

export interface SuggestionInput {
  id: number
  question_text: string
  sport: string
  game_type: string
  competition: string | null
  difficulty: string | null
  evergreen_type: string | null
  monthly_category: string | null
  cooldown_years: number | null
  last_used_at: string | null
  last_verified_at: string | null
  question_date: string | null
  status: string
}

export interface NearbyScheduled {
  id: number
  sport: string
  game_type: string
  competition: string | null
  difficulty: string | null
  question_date: string
}

export interface ScoredSuggestion {
  id: number
  question_text: string
  sport: string
  game_type: string
  competition: string | null
  difficulty: string | null
  evergreen_type: string | null
  monthly_category: string | null
  previousUse: string | null
  score: number
  reasons: string[]
  warnings: string[]
}

const COMPETITION_WINDOW_DAYS = 7
const VERIFY_MAX_DAYS = 90

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000)
}

/** Most recent date a question actually ran: last_used_at, or a past scheduled date. */
export function previousUseDate(
  row: { last_used_at: string | null; question_date: string | null },
  today: string,
): string | null {
  const pastScheduled = row.question_date && row.question_date < today ? row.question_date : null
  if (!row.last_used_at) return pastScheduled
  if (!pastScheduled) return row.last_used_at
  return row.last_used_at > pastScheduled ? row.last_used_at : pastScheduled
}

export function scoreSuggestion(
  q: SuggestionInput,
  targetDate: string,
  today: string,
  nearby: NearbyScheduled[],
): ScoredSuggestion {
  const reasons: string[] = []
  const warnings: string[] = []
  let score = 0

  const previousUse = previousUseDate(q, today)
  if (!previousUse) {
    score += 3
    reasons.push("Never used")
  } else {
    const clearedOn = getCooldownUntil(previousUse, q.cooldown_years) ?? previousUse
    score += Math.min(2, Math.max(0, daysBetween(targetDate, clearedOn) / 365))
    reasons.push(`Last used ${previousUse}`)
  }

  if (q.monthly_category) {
    const planned = matchPlannedCategory(q.sport, q.monthly_category)
    const expected = categoryForDate(q.sport, targetDate)
    if (!planned) {
      warnings.push(`"${q.monthly_category}" is not a planned ${q.sport.toUpperCase()} monthly category`)
    } else if (planned === expected) {
      score += 3
      reasons.push(`Fits this month's category "${planned}"`)
    } else {
      score -= 2
      warnings.push(`Planned for "${planned}"; this month is "${expected ?? "none"}"`)
    }
  }

  if (q.evergreen_type === "true_evergreen") {
    score += 1
    reasons.push("True evergreen")
  } else if (q.evergreen_type === "snapshot" || q.evergreen_type === "live") {
    const label = q.evergreen_type === "live" ? "Live" : "Snapshot"
    const verifiedDaysAgo = q.last_verified_at ? daysBetween(targetDate, q.last_verified_at) : null
    score -= 1
    if (verifiedDaysAgo === null || verifiedDaysAgo > VERIFY_MAX_DAYS) {
      score -= 3
      warnings.push(
        q.last_verified_at ? `${label} answers last verified ${q.last_verified_at}` : `${label} answers never verified`,
      )
    }
  }

  const others = nearby.filter((n) => n.id !== q.id && n.sport === q.sport && n.question_date !== targetDate)

  if (q.competition) {
    const clash = others.find(
      (n) =>
        n.competition === q.competition &&
        Math.abs(daysBetween(n.question_date, targetDate)) <= COMPETITION_WINDOW_DAYS,
    )
    if (clash) {
      score -= 2
      warnings.push(`${q.competition} also scheduled on ${clash.question_date}`)
    }
  }

  if (q.difficulty) {
    const dayBefore = others.find(
      (n) => n.game_type === q.game_type && daysBetween(targetDate, n.question_date) === 1,
    )
    if (dayBefore && dayBefore.difficulty === q.difficulty) {
      score -= 1
      warnings.push(`Same difficulty (${q.difficulty}) as the day before`)
    }
  }

  return {
    id: q.id,
    question_text: q.question_text,
    sport: q.sport,
    game_type: q.game_type,
    competition: q.competition,
    difficulty: q.difficulty,
    evergreen_type: q.evergreen_type,
    monthly_category: q.monthly_category,
    previousUse,
    score: Math.round(score * 10) / 10,
    reasons,
    warnings,
  }
}
