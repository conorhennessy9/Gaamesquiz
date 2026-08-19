import { Suspense } from "react"
import { getQuestionLibrary, getDistinctCompetitions } from "@/lib/cms/questions-actions"
import QuestionsTable from "./questions-table"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Questions | GAAmesquiz Admin",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminQuestionsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const filters = {
    search: first(params.q),
    sport: first(params.sport),
    game_type: first(params.game),
    status: first(params.status),
    difficulty: first(params.difficulty),
    evergreen_type: first(params.evergreen),
    competition: first(params.competition),
    cooldown_years: first(params.cooldown),
    page: Number(first(params.page)) || 1,
  }

  return (
    <div className="max-w-[1400px]">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-white text-xl font-bold tracking-tight">Question Library</h1>
          <p className="text-zinc-500 text-sm mt-1">Search, filter, and manage all rugby and GAA quiz questions.</p>
        </div>
      </div>

      <Suspense fallback={<QuestionsTableSkeleton />}>
        <QuestionsTableLoader filters={filters} />
      </Suspense>
    </div>
  )
}

async function QuestionsTableLoader({ filters }: { filters: Parameters<typeof getQuestionLibrary>[0] }) {
  const [result, competitions] = await Promise.all([getQuestionLibrary(filters), getDistinctCompetitions()])

  return (
    <QuestionsTable
      initialData={result.data}
      count={result.count}
      page={result.page}
      pageSize={result.pageSize}
      hasExtendedColumns={result.hasExtendedColumns}
      competitions={competitions}
      filters={filters}
    />
  )
}

function QuestionsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 bg-zinc-800" />
        ))}
      </div>
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full bg-zinc-900 border-b border-zinc-800 last:border-0" />
        ))}
      </div>
    </div>
  )
}
