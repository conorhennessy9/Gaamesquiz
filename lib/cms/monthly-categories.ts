// The planned monthly categories, exactly as defined by the editorial plan.
// Do not add, rename or merge entries here without an editorial decision:
// the scheduler matches these labels exactly.

export interface MonthlyCategory {
  label: string
  /** 1 = January … 12 = December */
  months: number[]
}

export const MONTHLY_CATEGORIES: Record<"rugby" | "gaa", MonthlyCategory[]> = {
  rugby: [
    { label: "Champions Cup / European competition", months: [1] },
    { label: "6 Nations", months: [2, 3] },
    { label: "Champions Cup", months: [4, 5] },
    { label: "Leagues", months: [6] },
    { label: "Internationals", months: [7] },
    { label: "Rugby Championship", months: [8] },
    { label: "Rugby World Cup", months: [9, 10] },
    { label: "International Rugby", months: [11] },
    { label: "Others", months: [12] },
  ],
  gaa: [
    { label: "Leagues", months: [1, 2, 3] },
    { label: "Provincial", months: [4, 5] },
    { label: "All-Ireland", months: [6, 7, 8] },
    { label: "Club", months: [9, 10, 11] },
    { label: "Universities", months: [12] },
  ],
}

function categoriesFor(sport: string | null | undefined): MonthlyCategory[] {
  return sport === "rugby" || sport === "gaa" ? MONTHLY_CATEGORIES[sport] : []
}

/** The planned category for a sport on a yyyy-MM-dd date, or null. */
export function categoryForDate(sport: string | null | undefined, date: string): string | null {
  const month = Number(date.slice(5, 7))
  return categoriesFor(sport).find((c) => c.months.includes(month))?.label ?? null
}

/** Returns the canonical planned label if `value` is one of the sport's categories (case/space-insensitive). */
export function matchPlannedCategory(sport: string | null | undefined, value: string | null | undefined): string | null {
  const v = value?.trim().replace(/\s+/g, " ").toLowerCase()
  if (!v) return null
  return categoriesFor(sport).find((c) => c.label.toLowerCase() === v)?.label ?? null
}

/** Every planned label across both sports, de-duplicated, in plan order. */
export const ALL_MONTHLY_CATEGORY_LABELS: string[] = Array.from(
  new Set([...MONTHLY_CATEGORIES.rugby, ...MONTHLY_CATEGORIES.gaa].map((c) => c.label)),
)
