"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Search,
  X,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { STATUS_COLOURS, type QuizQuestion } from "@/lib/cms/types"
import { duplicateQuestion, deleteQuestionConfirmed, type QuestionLibraryFilters } from "@/lib/cms/questions-actions"

const SPORT_OPTIONS = [
  { value: "rugby", label: "Rugby" },
  { value: "gaa", label: "GAA" },
]

const GAME_OPTIONS = [
  { value: "tenable", label: "Tenable" },
  { value: "against_the_clock", label: "Timer" },
]

const EVERGREEN_OPTIONS = [
  { value: "true_evergreen", label: "True Evergreen" },
  { value: "semi_evergreen", label: "Semi-Evergreen" },
  { value: "snapshot", label: "Snapshot" },
  { value: "live", label: "Live" },
]

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "needs_review", label: "Needs Review" },
  { value: "verified", label: "Verified" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
]

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
]

const COOLDOWN_OPTIONS = [
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "4", label: "4 years" },
]

const FALLBACK_STATUS_STYLE = "bg-zinc-700 text-zinc-300"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return value
  }
}

function statusLabel(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status
}

interface QuestionsTableProps {
  initialData: QuizQuestion[]
  count: number
  page: number
  pageSize: number
  hasExtendedColumns: boolean
  competitions: string[]
  filters: QuestionLibraryFilters
}

export default function QuestionsTable({
  initialData,
  count,
  page,
  pageSize,
  hasExtendedColumns,
  competitions,
  filters,
}: QuestionsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(filters.search ?? "")
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [rowActionError, setRowActionError] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key)
        else next.set(key, value)
      }
      // Any filter/search change resets pagination back to page 1
      if (!("page" in updates)) next.delete("page")
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`)
      })
    },
    [pathname, router, searchParams],
  )

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      updateParams({ q: searchInput || null })
    },
    [searchInput, updateParams],
  )

  const activeFilterCount = useMemo(() => {
    return [
      filters.sport,
      filters.game_type,
      filters.status,
      filters.difficulty,
      filters.evergreen_type,
      filters.competition,
      filters.cooldown_years,
    ].filter(Boolean).length
  }, [filters])

  function clearAllFilters() {
    setSearchInput("")
    startTransition(() => {
      router.push(pathname)
    })
  }

  async function handleDuplicate(id: number) {
    setRowActionError(null)
    const result = await duplicateQuestion(id)
    if (!result.success) {
      setRowActionError(result.error ?? "Failed to duplicate question")
      return
    }
    startTransition(() => {
      router.refresh()
    })
  }

  async function handleDeleteConfirmed() {
    if (pendingDeleteId === null) return
    setRowActionError(null)
    const result = await deleteQuestionConfirmed(pendingDeleteId)
    setPendingDeleteId(null)
    if (!result.success) {
      setRowActionError(result.error ?? "Failed to delete question")
      return
    }
    startTransition(() => {
      router.refresh()
    })
  }

  const rangeStart = count === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, count)

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search question text..."
            className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
        <Button type="submit" variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
          Search
        </Button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          placeholder="Sport"
          value={filters.sport}
          options={SPORT_OPTIONS}
          onChange={(v) => updateParams({ sport: v })}
        />
        <FilterSelect
          placeholder="Game"
          value={filters.game_type}
          options={GAME_OPTIONS}
          onChange={(v) => updateParams({ game: v })}
        />
        <FilterSelect
          placeholder="Evergreen Type"
          value={filters.evergreen_type}
          options={EVERGREEN_OPTIONS}
          onChange={(v) => updateParams({ evergreen: v })}
          disabled={!hasExtendedColumns}
        />
        <FilterSelect
          placeholder="Status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(v) => updateParams({ status: v })}
        />
        <FilterSelect
          placeholder="Difficulty"
          value={filters.difficulty}
          options={DIFFICULTY_OPTIONS}
          onChange={(v) => updateParams({ difficulty: v })}
        />
        <FilterSelect
          placeholder="Competition"
          value={filters.competition}
          options={competitions.map((c) => ({ value: c, label: c }))}
          onChange={(v) => updateParams({ competition: v })}
          disabled={!hasExtendedColumns || competitions.length === 0}
        />
        <FilterSelect
          placeholder="Cooldown"
          value={filters.cooldown_years}
          options={COOLDOWN_OPTIONS}
          onChange={(v) => updateParams({ cooldown: v })}
          disabled={!hasExtendedColumns}
        />

        {(activeFilterCount > 0 || filters.search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </Button>
        )}
      </div>

      {!hasExtendedColumns && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            Competition, Evergreen Type, Last Verified, and Cooldown are not yet tracked in the database — those
            columns and filters will activate automatically once the schema is updated.
          </span>
        </div>
      )}

      {rowActionError && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {rowActionError}
        </div>
      )}

      {/* Table */}
      <div className={`rounded-lg border border-zinc-800 overflow-hidden transition-opacity ${isPending ? "opacity-60" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Question</TableHead>
              <TableHead className="text-zinc-400">Sport</TableHead>
              <TableHead className="text-zinc-400">Competition</TableHead>
              <TableHead className="text-zinc-400">Game</TableHead>
              <TableHead className="text-zinc-400">Difficulty</TableHead>
              <TableHead className="text-zinc-400">Evergreen Type</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Last Verified</TableHead>
              <TableHead className="text-zinc-400">Cooldown</TableHead>
              <TableHead className="text-zinc-400">Scheduled Date</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableCell colSpan={11} className="text-center text-zinc-500 py-12">
                  No questions match your filters.
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((q) => {
                const extended = q as QuizQuestion & {
                  competition?: string | null
                  evergreen_type?: string | null
                  last_verified_at?: string | null
                  cooldown_years?: number | null
                }
                return (
                  <TableRow key={q.id} className="border-zinc-800 hover:bg-zinc-900/50 group">
                    <TableCell className="max-w-[320px]">
                      <button
                        onClick={() => router.push(`/admin/questions/${q.id}/edit`)}
                        className="text-left text-white text-sm line-clamp-2 hover:underline underline-offset-2"
                      >
                        {q.question_text}
                      </button>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm capitalize">{q.sport}</TableCell>
                    <TableCell className="text-zinc-300 text-sm">
                      {extended.competition ?? <span className="text-zinc-600">—</span>}
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm">
                      {GAME_OPTIONS.find((g) => g.value === q.game_type)?.label ?? q.game_type}
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm capitalize">
                      {q.difficulty ?? <span className="text-zinc-600">—</span>}
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm">
                      {extended.evergreen_type ? (
                        EVERGREEN_OPTIONS.find((e) => e.value === extended.evergreen_type)?.label
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${STATUS_COLOURS[q.status] ?? FALLBACK_STATUS_STYLE} border-0`}>
                        {statusLabel(q.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm">{formatDate(extended.last_verified_at)}</TableCell>
                    <TableCell className="text-zinc-300 text-sm">
                      {extended.cooldown_years ? `${extended.cooldown_years} yr` : <span className="text-zinc-600">—</span>}
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm">{formatDate(q.question_date)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open actions for question {q.id}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/questions/${q.id}/edit`)}
                            className="focus:bg-zinc-800 focus:text-white cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(q.id)}
                            className="focus:bg-zinc-800 focus:text-white cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setPendingDeleteId(q.id)}
                            className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          {count === 0 ? "0 results" : `Showing ${rangeStart}\u2013${rangeEnd} of ${count}`}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isPending}
            onClick={() => updateParams({ page: String(page - 1) })}
            className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <span className="text-zinc-400 px-1">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isPending}
            onClick={() => updateParams({ page: String(page + 1) })}
            className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={pendingDeleteId !== null} onOpenChange={(open: boolean) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This permanently deletes the question from the library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function FilterSelect({
  placeholder,
  value,
  options,
  onChange,
  disabled,
}: {
  placeholder: string
  value: string | undefined
  options: { value: string; label: string }[]
  onChange: (value: string | null) => void
  disabled?: boolean
}) {
  return (
    <Select
      value={value ?? "__all"}
      onValueChange={(v) => onChange(v === "__all" ? null : v)}
      disabled={disabled}
    >
      <SelectTrigger className="w-auto min-w-[140px] h-9 bg-zinc-900 border-zinc-800 text-zinc-300 disabled:opacity-40">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
        <SelectItem value="__all" className="focus:bg-zinc-800 focus:text-white">
          All {placeholder}
        </SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="focus:bg-zinc-800 focus:text-white">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
