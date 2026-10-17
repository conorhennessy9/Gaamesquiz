// Pure review-due rules for the Update Centre. Everything here is read-only:
// it only decides which questions an admin should look at. It never changes
// answers, status, or any other field.

export interface ReviewQuestion {
  id: number
  question_text: string
  answers: string[] | null
  sport: string
  game_type: string
  status: string
  competition: string | null
  evergreen_type: string | null
  review_frequency: string | null
  update_trigger: string | null
  snapshot_period: string | null
  last_verified_at: string | null
  question_date: string | null
}

export interface ReviewItem extends ReviewQuestion {
  isDue: boolean
  dueReason: string | null
  daysSinceVerified: number | null
}

// Matches the scheduler's verification warning for snapshot/live questions.
export const SNAPSHOT_LIVE_MAX_DAYS = 90
const MONTHLY_MAX_DAYS = 31
const YEARLY_MAX_DAYS = 365

function daysBetween(earlier: string, later: string): number {
  const a = Date.UTC(+earlier.slice(0, 4), +earlier.slice(5, 7) - 1, +earlier.slice(8, 10))
  const b = Date.UTC(+later.slice(0, 4), +later.slice(5, 7) - 1, +later.slice(8, 10))
  return Math.round((b - a) / 86_400_000)
}

function staleReason(days: number | null, maxDays: number, label: string): string | null {
  if (days === null) return `${label}: never verified`
  if (days > maxDays) return `${label}: last verified ${days} days ago`
  return null
}

export function evaluateReview(q: ReviewQuestion, today: string): ReviewItem {
  const daysSinceVerified = q.last_verified_at ? daysBetween(q.last_verified_at, today) : null
  let dueReason: string | null = null

  if (q.status === "needs_review") {
    dueReason = "Status is Needs review"
  } else {
    switch (q.review_frequency) {
      case "monthly":
        dueReason = staleReason(daysSinceVerified, MONTHLY_MAX_DAYS, "Monthly review")
        break
      case "annual":
        dueReason = staleReason(daysSinceVerified, YEARLY_MAX_DAYS, "Annual review")
        break
      case "competition_end":
        dueReason = staleReason(daysSinceVerified, YEARLY_MAX_DAYS, "Competition-end review")
        break
      case "never":
      case "manual":
        dueReason = null
        break
      default:
        if (q.evergreen_type === "snapshot" || q.evergreen_type === "live") {
          dueReason = staleReason(
            daysSinceVerified,
            SNAPSHOT_LIVE_MAX_DAYS,
            q.evergreen_type === "live" ? "Live" : "Snapshot",
          )
        } else if (q.evergreen_type === "semi_evergreen") {
          dueReason = staleReason(daysSinceVerified, YEARLY_MAX_DAYS, "Semi-evergreen")
        }
    }
  }

  return { ...q, isDue: dueReason !== null, dueReason, daysSinceVerified }
}

export function isCompetitionReview(q: ReviewQuestion): boolean {
  return q.review_frequency === "competition_end" || (!!q.competition && !!q.update_trigger)
}
