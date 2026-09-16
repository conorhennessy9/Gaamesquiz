import { getCalendarMonth } from "@/lib/cms/calendar-actions"
import CalendarGrid from "./calendar-grid"

export const metadata = {
  title: "Calendar | GAAmesquiz Admin",
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const now = new Date()

  const year = Number(first(params.year)) || now.getFullYear()
  const month = Number(first(params.month)) || now.getMonth() + 1

  const result = await getCalendarMonth(year, month)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Calendar</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          See what&apos;s scheduled across the month. Click a day to move or remove its questions.
        </p>
      </div>

      <CalendarGrid year={result.year} month={result.month} days={result.days} />
    </div>
  )
}
