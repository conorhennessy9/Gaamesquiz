"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CalendarX2, ArrowRightLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DatePickerField } from "@/components/admin/date-picker-field"
import {
  FILL_STATUS_COLOURS,
  FILL_STATUS_LABELS,
  REQUIRED_SLOTS_PER_DAY,
  type CalendarDayQuestion,
  type CalendarDaySummary,
} from "@/lib/cms/calendar-types"
import { GAME_TYPE_OPTIONS, SPORT_OPTIONS } from "@/lib/cms/schedule-types"
import { getCalendarDayQuestions, moveCalendarQuestion, removeCalendarQuestion } from "@/lib/cms/calendar-actions"

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`
}

function sportLabel(value: string) {
  return SPORT_OPTIONS.find((s) => s.value === value)?.label ?? value
}

function gameTypeLabel(value: string) {
  return GAME_TYPE_OPTIONS.find((g) => g.value === value)?.label ?? value
}

/** Builds the 7-column grid of cells for a month view, padded with leading/trailing blanks. */
function buildMonthCells(year: number, month: number): { date: string | null; day: number | null }[] {
  const firstOfMonth = new Date(year, month - 1, 1)
  // getDay(): 0 = Sunday .. 6 = Saturday. We want a Monday-first grid.
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells: { date: string | null; day: number | null }[] = []
  for (let i = 0; i < leadingBlanks; i++) cells.push({ date: null, day: null })
  for (let day = 1; day <= daysInMonth; day++) cells.push({ date: toISO(year, month, day), day })
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null })
  return cells
}

interface CalendarGridProps {
  year: number
  month: number
  days: Record<string, CalendarDaySummary>
}

export default function CalendarGrid({ year, month, days }: CalendarGridProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const cells = useMemo(() => buildMonthCells(year, month), [year, month])
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const monthTotals = useMemo(() => {
    const values = Object.values(days)
    return {
      empty: cells.filter((c) => c.date && !days[c.date]).length,
      needsContent: values.filter((d) => d.fillStatus === "needs_content").length,
      fullyPopulated: values.filter((d) => d.fillStatus === "fully_populated").length,
    }
  }, [cells, days])

  function goToMonth(deltaMonths: number) {
    let newMonth = month + deltaMonths
    let newYear = year
    if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    } else if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    }
    startTransition(() => {
      router.push(`/admin/calendar?year=${newYear}&month=${newMonth}`)
    })
  }

  function goToToday() {
    const now = new Date()
    startTransition(() => {
      router.push(`/admin/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`)
    })
  }

  return (
    <div className="space-y-4">
      {/* Month nav + legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
            onClick={() => goToMonth(-1)}
            disabled={isPending}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium text-white w-44 text-center">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
            onClick={() => goToMonth(1)}
            disabled={isPending}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={goToToday}
            disabled={isPending}
          >
            Today
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <LegendItem colour={FILL_STATUS_COLOURS.empty} label={`${monthTotals.empty} empty`} />
          <LegendItem colour={FILL_STATUS_COLOURS.needs_content} label={`${monthTotals.needsContent} need content`} />
          <LegendItem colour={FILL_STATUS_COLOURS.fully_populated} label={`${monthTotals.fullyPopulated} fully populated`} />
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-zinc-500 py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className={`grid grid-cols-7 gap-2 transition-opacity ${isPending ? "opacity-60" : ""}`}>
        {cells.map((cell, i) => {
          if (!cell.date || !cell.day) {
            return <div key={`blank-${i}`} className="rounded-lg border border-transparent min-h-[92px]" />
          }
          const summary = days[cell.date]
          const isToday = cell.date === todayISO
          return (
            <DayCell
              key={cell.date}
              day={cell.day}
              date={cell.date}
              summary={summary}
              isToday={isToday}
              onClick={() => setSelectedDate(cell.date)}
            />
          )
        })}
      </div>

      {selectedDate && (
        <DayDetailDialog
          date={selectedDate}
          summary={days[selectedDate]}
          onOpenChange={(open) => {
            if (!open) setSelectedDate(null)
          }}
        />
      )}
    </div>
  )
}

function LegendItem({ colour, label }: { colour: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${colour.split(" ")[0]}`} />
      <span className="text-zinc-400">{label}</span>
    </div>
  )
}

function DayCell({
  day,
  date,
  summary,
  isToday,
  onClick,
}: {
  day: number
  date: string
  summary: CalendarDaySummary | undefined
  isToday: boolean
  onClick: () => void
}) {
  const fillStatus = summary?.fillStatus ?? "empty"
  const sportEntries = summary ? Object.entries(summary.bySport) : []
  const gameTypeEntries = summary ? Object.entries(summary.byGameType) : []

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[92px] rounded-lg border p-2 text-left flex flex-col gap-1.5 transition-colors hover:border-zinc-600 ${
        isToday ? "border-lime-500/50 bg-lime-500/5" : "border-zinc-800 bg-zinc-900/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isToday ? "text-lime-400" : "text-zinc-300"}`}>{day}</span>
        {summary && (
          <span className="text-[11px] text-zinc-500">
            {summary.count} q{summary.count === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <Badge className={`${FILL_STATUS_COLOURS[fillStatus]} border-0 w-fit text-[10px] px-1.5 py-0`}>
        {FILL_STATUS_LABELS[fillStatus]}
      </Badge>

      {sportEntries.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {sportEntries.map(([sport, count]) => (
            <span key={sport} className="text-[10px] text-zinc-400 bg-zinc-800/80 rounded px-1 py-0.5 capitalize">
              {sportLabel(sport)} {count}
            </span>
          ))}
        </div>
      )}
      {gameTypeEntries.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {gameTypeEntries.map(([gameType, count]) => (
            <span key={gameType} className="text-[10px] text-zinc-500 bg-zinc-800/50 rounded px-1 py-0.5">
              {gameTypeLabel(gameType)} {count}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

function formatDateLong(value: string) {
  try {
    return new Date(value).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
  } catch {
    return value
  }
}

function DayDetailDialog({
  date,
  summary,
  onOpenChange,
}: {
  date: string
  summary: CalendarDaySummary | undefined
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [questions, setQuestions] = useState<CalendarDayQuestion[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [movingId, setMovingId] = useState<number | null>(null)
  const [moveTarget, setMoveTarget] = useState<string>("")

  useEffect(() => {
    let active = true
    setLoading(true)
    getCalendarDayQuestions(date).then((data) => {
      if (active) {
        setQuestions(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [date])

  async function handleRemove(id: number) {
    setActionError(null)
    setPendingId(id)
    const result = await removeCalendarQuestion(id)
    setPendingId(null)
    if (!result.success) {
      setActionError(result.error ?? "Failed to remove question")
      return
    }
    setQuestions((prev) => (prev ?? []).filter((q) => q.id !== id))
    router.refresh()
  }

  async function handleMove(id: number) {
    if (!moveTarget) return
    setActionError(null)
    setPendingId(id)
    const result = await moveCalendarQuestion(id, moveTarget)
    setPendingId(null)
    if (!result.success) {
      setActionError(result.error ?? "Failed to move question")
      return
    }
    setQuestions((prev) => (prev ?? []).filter((q) => q.id !== id))
    setMovingId(null)
    setMoveTarget("")
    router.refresh()
  }

  const filledSlots = summary?.filledSlots ?? 0

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{formatDateLong(date)}</DialogTitle>
          <DialogDescription className="text-zinc-500">
            {filledSlots} of {REQUIRED_SLOTS_PER_DAY} sport &amp; game type slots filled
          </DialogDescription>
        </DialogHeader>

        {actionError && (
          <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : !questions || questions.length === 0 ? (
          <p className="text-sm text-zinc-500 py-6 text-center">No questions scheduled for this day.</p>
        ) : (
          <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
            {questions.map((q) => (
              <li key={q.id} className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-medium text-zinc-300">
                    {q.scheduled_position}
                  </span>
                  <p className="flex-1 text-sm text-zinc-200 line-clamp-2">{q.question_text}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-7">
                  <span className="text-[11px] text-zinc-400 bg-zinc-800/80 rounded px-1.5 py-0.5 capitalize">
                    {sportLabel(q.sport)}
                  </span>
                  <span className="text-[11px] text-zinc-400 bg-zinc-800/80 rounded px-1.5 py-0.5">
                    {gameTypeLabel(q.game_type)}
                  </span>
                  {q.difficulty && (
                    <span className="text-[11px] text-zinc-500 bg-zinc-800/50 rounded px-1.5 py-0.5 capitalize">
                      {q.difficulty}
                    </span>
                  )}
                  {q.monthly_category && (
                    <span className="text-[11px] text-zinc-500 bg-zinc-800/50 rounded px-1.5 py-0.5">
                      {q.monthly_category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pl-7">
                  {movingId === q.id ? (
                    <>
                      <div className="w-40">
                        <DatePickerField value={moveTarget} onChange={setMoveTarget} placeholder="New date" />
                      </div>
                      <Button
                        size="sm"
                        disabled={!moveTarget || pendingId === q.id}
                        onClick={() => handleMove(q.id)}
                        className="bg-lime-500 text-black hover:bg-lime-400 disabled:opacity-40"
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setMovingId(null)
                          setMoveTarget("")
                        }}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pendingId === q.id}
                        onClick={() => setMovingId(q.id)}
                        className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Move
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pendingId === q.id}
                        onClick={() => handleRemove(q.id)}
                        className="border-zinc-800 bg-transparent text-red-300 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <CalendarX2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
