"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Plus, X, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { approveSchedule } from "@/lib/cms/schedule-actions"
import type { ScoredSuggestion } from "@/lib/cms/schedule-suggest"
import { GAME_TYPE_OPTIONS } from "@/lib/cms/schedule-types"

interface ScheduleSuggestionsProps {
  date: string
  dateLabel: string
  suggestions: ScoredSuggestion[]
  considered: number
  loadError?: string
}

function gameLabel(value: string) {
  return GAME_TYPE_OPTIONS.find((g) => g.value === value)?.label ?? value
}

export default function ScheduleSuggestions({
  date,
  dateLabel,
  suggestions,
  considered,
  loadError,
}: ScheduleSuggestionsProps) {
  const router = useRouter()
  const [draft, setDraft] = useState<ScoredSuggestion[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [isSaving, startSaving] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; message: string; errors: string[] } | null>(null)

  const [draftDate, setDraftDate] = useState(date)
  if (draftDate !== date) {
    setDraftDate(date)
    setDraft([])
    setConfirmed(false)
    setResult(null)
  }

  const draftIds = new Set(draft.map((d) => d.id))

  function addToDraft(s: ScoredSuggestion) {
    if (draftIds.has(s.id)) return
    setDraft((d) => [...d, s])
    setConfirmed(false)
    setResult(null)
  }

  function removeFromDraft(id: number) {
    setDraft((d) => d.filter((s) => s.id !== id))
    setConfirmed(false)
  }

  function move(index: number, delta: -1 | 1) {
    setDraft((d) => {
      const next = [...d]
      const target = index + delta
      if (target < 0 || target >= next.length) return d
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setConfirmed(false)
  }

  function handleApprove() {
    if (!confirmed || draft.length === 0) return
    startSaving(async () => {
      const res = await approveSchedule(
        date,
        draft.map((d) => d.id),
      )
      const textFor = (id: number) => draft.find((d) => d.id === id)?.question_text ?? `Question ${id}`
      const errors = res.errors.map((e) => (e.id ? `${textFor(e.id)}: ${e.error}` : e.error))
      if (res.success) {
        setResult({ ok: true, message: `Scheduled ${res.scheduled} question${res.scheduled === 1 ? "" : "s"} for ${dateLabel}.`, errors: [] })
        setDraft([])
        setConfirmed(false)
      } else {
        setResult({
          ok: false,
          message: res.scheduled > 0 ? `Only ${res.scheduled} were scheduled.` : "Nothing was scheduled.",
          errors,
        })
      }
      router.refresh()
    })
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 text-zinc-500" />
        <h2 className="text-sm font-medium text-white">Suggestions for {dateLabel}</h2>
        <span className="text-xs text-zinc-500">
          {"Top "}
          {suggestions.length} of {considered} eligible verified question{considered === 1 ? "" : "s"}. Uses your filters
          above. Nothing is scheduled until you approve.
        </span>
      </div>

      {loadError ? (
        <p className="text-xs text-red-300">Could not load suggestions: {loadError}</p>
      ) : suggestions.length === 0 ? (
        <p className="text-xs text-zinc-500">
          No verified, unscheduled questions outside their cooldown match these filters.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="flex items-start gap-3 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-200 line-clamp-2">{s.question_text}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  <span className="capitalize">{s.sport}</span> · {gameLabel(s.game_type)}
                  {s.competition && ` · ${s.competition}`}
                  {s.difficulty && <span className="capitalize">{` · ${s.difficulty}`}</span>}
                  {` · ${s.previousUse ? `last used ${s.previousUse}` : "never used"}`}
                </p>
                {(s.reasons.length > 0 || s.warnings.length > 0) && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.reasons.map((r) => (
                      <span key={r} className="rounded bg-lime-500/10 px-1.5 py-0.5 text-[11px] text-lime-300">
                        {r}
                      </span>
                    ))}
                    {s.warnings.map((w) => (
                      <span
                        key={w}
                        className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[11px] text-amber-300"
                      >
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        {w}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={draftIds.has(s.id)}
                onClick={() => addToDraft(s)}
                className="shrink-0 border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                {draftIds.has(s.id) ? "In draft" : "Add to draft"}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-zinc-800 pt-4 space-y-3">
        <h3 className="text-sm font-medium text-white">
          Draft schedule <span className="text-xs font-normal text-zinc-500">({draft.length} not yet saved)</span>
        </h3>

        {draft.length === 0 ? (
          <p className="text-xs text-zinc-500">Add suggestions to build a draft, then review and approve it.</p>
        ) : (
          <ol className="space-y-1.5">
            {draft.map((s, index) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-md border border-dashed border-zinc-700 px-3 py-2"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-300">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{s.question_text}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Move "${s.question_text}" earlier in the draft`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    disabled={index === draft.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Move "${s.question_text}" later in the draft`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    onClick={() => removeFromDraft(s.id)}
                    aria-label={`Remove "${s.question_text}" from the draft`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}

        {draft.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} />
              {`I've reviewed this draft and approve scheduling ${draft.length} question${draft.length === 1 ? "" : "s"} for ${dateLabel}.`}
            </label>
            <Button
              size="sm"
              disabled={!confirmed || isSaving}
              onClick={handleApprove}
              className="bg-lime-500 text-black hover:bg-lime-400 disabled:opacity-40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isSaving ? "Saving..." : "Approve schedule"}
            </Button>
          </div>
        )}

        {result && (
          <div
            role="status"
            className={`rounded-md border px-3 py-2 text-xs ${
              result.ok
                ? "border-lime-500/20 bg-lime-500/10 text-lime-300"
                : "border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            <p>{result.message}</p>
            {result.errors.length > 0 && (
              <ul className="mt-1 list-disc pl-4">
                {result.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
