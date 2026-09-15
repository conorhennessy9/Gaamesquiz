import { getScheduleCandidates, getScheduleFilterOptions, getScheduledRunningOrder } from "@/lib/cms/schedule-actions"
import type { ScheduleFilters } from "@/lib/cms/schedule-types"
import ScheduleTable from "./schedule-table"

export const metadata = {
  title: "Schedule | GAAmesquiz Admin",
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams

  const filters: ScheduleFilters = {
    date: first(params.date) || todayISO(),
    sport: first(params.sport),
    competition: first(params.competition),
    theme: first(params.theme),
    game_type: first(params.game),
    difficulty: first(params.difficulty),
    evergreen_type: first(params.evergreen),
    cooldown_years: first(params.cooldown),
    monthly_category: first(params.category),
    status: first(params.status),
    page: first(params.page) ? Number(first(params.page)) : 1,
  }

  const [result, filterOptions, runningOrder] = await Promise.all([
    getScheduleCandidates(filters),
    getScheduleFilterOptions(),
    getScheduledRunningOrder(filters.date),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Schedule</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Pick a date and see which questions in the library are eligible to run on it.
        </p>
      </div>

      <ScheduleTable
        initialData={result.data}
        count={result.count}
        page={result.page}
        pageSize={result.pageSize}
        filterOptions={filterOptions}
        filters={filters}
        runningOrder={runningOrder}
      />
    </div>
  )
}
