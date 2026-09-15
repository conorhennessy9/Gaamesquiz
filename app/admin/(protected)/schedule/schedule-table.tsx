"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { X, ChevronLeft, ChevronRight, CalendarClock, CalendarX2, ArrowUp, ArrowDown, ListOrdered } from "lucide-react"

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
import { DatePickerField } from "@/components/admin/date-picker-field"
import {
  ELIGIBILITY_COLOURS,
  ELIGIBILITY_LABELS,
  SPORT_OPTIONS,
  GAME_TYPE_OPTIONS,
  DIFFICULTY_OPTIONS,
  EVERGREEN_TYPE_OPTIONS,
  COOLDOWN_OPTIONS,
  QUESTION_STATUS_OPTIONS,
  type ScheduleCandidate,
  type ScheduleFilterOptions,
  type ScheduleFilters,
  type ScheduledRunningOrderItem,
} from "@/lib/cms/schedule-types"
import { APPROVED_STATUS } from "@/lib/cms/schedule-cooldown"
import { scheduleQuestion, unscheduleQuestion, moveScheduledPosition } from "@/lib/cms/schedule-actions"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return value
  }
}

function statusLabel(status: string) {
  return QUESTION_STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status
}

interface ScheduleTableProps {
  initialData: ScheduleCandidate[]
  count: number
  page: number
  pageSize: number
  filterOptions: ScheduleFilterOptions
  filters: ScheduleFilters
  runningOrder: ScheduledRunningOrderItem[]
}

export default function ScheduleTable({
  initialData,
  count,
  page,
  pageSize,
  filterOptions,
  filters,
  runningOrder,
}: ScheduleTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingActionId, setPendingActionId] = useState<number | null>(null)
  const [pendingMoveId, setPendingMoveId] = useState<number | null>(null)

  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key)
        else next.set(key, value)
      }
      if (!("page" in updates)) next.delete("page")
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`)
      })
    },
    [pathname, router, searchParams],
  )

  const activeFilterCount = useMemo(() => {
    return [
      filters.sport,
      filters.competition,
      filters.theme,
      filters.game_type,
      filters.difficulty,
      filters.evergreen_type,
      filters.cooldown_years,
      filters.monthly_category,
      filters.status,
    ].filter(Boolean).length
  }, [filters])

  function clearAllFilters() {
    startTransition(() => {
      router.push(`${pathname}?date=${filters.date}`)
    })
  }

  const eligibleCount = useMemo(
    () => initialData.filter((c) => c.eligibility === "eligible" || c.eligibility === "scheduled_this_date").length,
    [initialData],
  )

  async function handleSchedule(id: number) {
    setActionError(null)
    setPendingActionId(id)
    const result = await scheduleQuestion(id, filters.date)
    setPendingActionId(null)
    if (!result.success) {
      setActionError(result.error ?? "Failed to schedule question")
      return
    }
    startTransition(() => {
      router.refresh()
    })
  }

  async function handleUnschedule(id: number) {
    setActionError(null)
    setPendingActionId(id)
    const result = await unscheduleQuestion(id)
    setPendingActionId(null)
    if (!result.success) {
      setActionError(result.error ?? "Failed to unschedule question")
      return
    }
    startTransition(() => {
      router.refresh()
    })
  }

  async function handleMove(id: number, direction: "up" | "down") {
    setActionError(null)
    setPendingMoveId(id)
    const result = await moveScheduledPosition(filters.date, id, direction)
    setPendingMoveId(null)
    if (!result.success) {
      setActionError(result.error ?? "Failed to reorder question")
      return
    }
    startTransition(() => {
      router.refresh()
    })
  }

  function eligibilityHint(c: ScheduleCandidate): string | undefined {
    if (c.eligibility === "not_schedulable_status") {
      return `Only "${statusLabel(APPROVED_STATUS)}" (approved) questions can be scheduled — this one is "${statusLabel(c.status)}".`
    }
    if (c.eligibility === "cooldown" && c.cooldownUntil) {
      return `In cooldown until ${formatDate(c.cooldownUntil)}.`
    }
    return undefined
  }

  const rangeStart = count === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, count)

  return (
    <div className="space-y-4">
      {/* Date picker + summary */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-5 w-5 text-zinc-500" />
          <div>
            <div className="text-xs text-zinc-500 mb-1">Scheduling for</div>
            <div className="w-56">
              <DatePickerField
                value={filters.date}
                onChange={(v) => updateParams({ date: v || new Date().toISOString().slice(0, 10) })}
              />
            </div>
          </div>
        </div>
        <div className="text-sm text-zinc-400">
          <span className="text-white font-medium">{eligibleCount}</span> eligible of{" "}
          <span className="text-white font-medium">{initialData.length}</span> shown for {formatDate(filters.date)}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          placeholder="Sport"
          value={filters.sport}
          options={SPORT_OPTIONS}
          onChange={(v) => updateParams({ sport: v })}
        />
        <FilterSelect
          placeholder="Competition"
          value={filters.competition}
          options={filterOptions.competitions.map((c) => ({ value: c, label: c }))}
          onChange={(v) => updateParams({ competition: v })}
          disabled={filterOptions.competitions.length === 0}
        />
        <FilterSelect
          placeholder="Theme"
          value={filters.theme}
          options={filterOptions.themes.map((t) => ({ value: t, label: t }))}
          onChange={(v) => updateParams({ theme: v })}
          disabled={filterOptions.themes.length === 0}
        />
        <FilterSelect
          placeholder="Game Type"
          value={filters.game_type}
          options={GAME_TYPE_OPTIONS}
          onChange={(v) => updateParams({ game: v })}
        />
        <FilterSelect
          placeholder="Difficulty"
          value={filters.difficulty}
          options={DIFFICULTY_OPTIONS}
          onChange={(v) => updateParams({ difficulty: v })}
        />
        <FilterSelect
          placeholder="Evergreen Type"
          value={filters.evergreen_type}
          options={EVERGREEN_TYPE_OPTIONS}
          onChange={(v) => updateParams({ evergreen: v })}
        />
        <FilterSelect
          placeholder="Cooldown"
          value={filters.cooldown_years}
          options={COOLDOWN_OPTIONS}
          onChange={(v) => updateParams({ cooldown: v })}
        />
        <FilterSelect
          placeholder="Monthly Category"
          value={filters.monthly_category}
          options={filterOptions.monthlyCategories.map((c) => ({ value: c, label: c }))}
          onChange={(v) => updateParams({ category: v })}
          disabled={filterOptions.monthlyCategories.length === 0}
        />
        <FilterSelect
          placeholder="Status"
          value={filters.status}
          options={QUESTION_STATUS_OPTIONS}
          onChange={(v) => updateParams({ status: v })}
        />

        {activeFilterCount > 0 && (
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

      {actionError && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {actionError}
        </div>
      )}

      {/* Running order for the selected date */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-medium text-white">Running order for {formatDate(filters.date)}</h2>
          <span className="text-xs text-zinc-500">
            {runningOrder.length} question{runningOrder.length === 1 ? "" : "s"} scheduled
          </span>
        </div>
        {runningOrder.length === 0 ? (
          <p className="text-xs text-zinc-500">No questions scheduled for this date yet.</p>
        ) : (
          <ol className="space-y-1.5">
            {runningOrder.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
                  {item.scheduled_position}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{item.question_text}</span>
                <span className="text-xs text-zinc-500 capitalize shrink-0">{item.sport}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                    disabled={index === 0 || pendingMoveId === item.id}
                    onClick={() => handleMove(item.id, "up")}
                    aria-label={`Move "${item.question_text}" earlier in the running order`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                    disabled={index === runningOrder.length - 1 || pendingMoveId === item.id}
                    onClick={() => handleMove(item.id, "down")}
                    aria-label={`Move "${item.question_text}" later in the running order`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Table */}
      <div className={`rounded-lg border border-zinc-800 overflow-hidden transition-opacity ${isPending ? "opacity-60" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Question</TableHead>
              <TableHead className="text-zinc-400">Sport</TableHead>
              <TableHead className="text-zinc-400">Competition</TableHead>
              <TableHead className="text-zinc-400">Theme</TableHead>
              <TableHead className="text-zinc-400">Game Type</TableHead>
              <TableHead className="text-zinc-400">Difficulty</TableHead>
              <TableHead className="text-zinc-400">Evergreen</TableHead>
              <TableHead className="text-zinc-400">Cooldown</TableHead>
              <TableHead className="text-zinc-400">Previous Usage</TableHead>
              <TableHead className="text-zinc-400">Scheduled Date</TableHead>
              <TableHead className="text-zinc-400">Position</TableHead>
              <TableHead className="text-zinc-400">Category</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Eligibility</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableCell colSpan={15} className="text-center text-zinc-500 py-12">
                  No questions match your filters.
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((c) => (
                <TableRow key={c.id} className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell className="max-w-[280px]">
                    <span className="text-white text-sm line-clamp-2">{c.question_text}</span>
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm capitalize">{c.sport}</TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {c.competition ?? <span className="text-zinc-600">—</span>}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {c.theme ?? <span className="text-zinc-600">—</span>}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {GAME_TYPE_OPTIONS.find((g) => g.value === c.game_type)?.label ?? c.game_type}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm capitalize">
                    {c.difficulty ?? <span className="text-zinc-600">—</span>}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {c.evergreen_type ? (
                      EVERGREEN_TYPE_OPTIONS.find((e) => e.value === c.evergreen_type)?.label
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {c.cooldown_years ? `${c.cooldown_years} yr` : <span className="text-zinc-600">—</span>}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {c.last_used_at ? (
                      formatDate(c.last_used_at)
                    ) : (
                      <span className="text-zinc-600">Never used</span>
                    )}
                    {c.eligibility === "cooldown" && c.cooldownUntil && (
                      <div className="text-[11px] text-amber-400 mt-0.5">until {formatDate(c.cooldownUntil)}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">{formatDate(c.question_date)}</TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {c.scheduled_position ?? <span className="text-zinc-600">—</span>}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {c.monthly_category ?? <span className="text-zinc-600">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-zinc-700 text-zinc-300 border-0">{statusLabel(c.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${ELIGIBILITY_COLOURS[c.eligibility]} border-0`}>
                      {ELIGIBILITY_LABELS[c.eligibility]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.eligibility === "scheduled_this_date" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingActionId === c.id}
                        onClick={() => handleUnschedule(c.id)}
                        className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        <CalendarX2 className="h-3.5 w-3.5" />
                        Unschedule
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={
                          pendingActionId === c.id ||
                          c.eligibility === "cooldown" ||
                          c.eligibility === "not_schedulable_status"
                        }
                        title={eligibilityHint(c)}
                        onClick={() => handleSchedule(c.id)}
                        className="bg-lime-500 text-black hover:bg-lime-400 disabled:opacity-40"
                      >
                        <CalendarClock className="h-3.5 w-3.5" />
                        Schedule
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>{count === 0 ? "0 results" : `Showing ${rangeStart}\u2013${rangeEnd} of ${count}`}</span>
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
    <Select value={value ?? "__all"} onValueChange={(v) => onChange(v === "__all" ? null : v)} disabled={disabled}>
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
