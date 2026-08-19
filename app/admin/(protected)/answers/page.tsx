import { Suspense } from "react"
import { listAnswerLibrary } from "@/lib/cms/answer-library-actions"
import AnswersTable from "./answers-table"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Answer Library | GAAmesquiz Admin",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminAnswersPage({ searchParams }: PageProps) {
  const params = await searchParams

  const filters = {
    search: first(params.q),
    type: first(params.type) as any,
    sport: first(params.sport) as any,
    active: (first(params.active) as any) ?? "all",
    page: Number(first(params.page)) || 1,
    pageSize: 25,
  }

  return (
    <div className="max-w-[1400px]">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-white text-xl font-bold tracking-tight">Answer Library</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage the shared bank of answers used by Tenable questions across rugby and GAA.
          </p>
        </div>
      </div>

      <Suspense fallback={<AnswersTableSkeleton />}>
        <AnswersTableLoader filters={filters} />
      </Suspense>
    </div>
  )
}

async function AnswersTableLoader({ filters }: { filters: Parameters<typeof listAnswerLibrary>[0] }) {
  const result = await listAnswerLibrary(filters)

  return (
    <AnswersTable
      initialEntries={result.entries}
      count={result.total}
      page={filters.page ?? 1}
      pageSize={filters.pageSize ?? 25}
      filters={filters}
    />
  )
}

function AnswersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
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
