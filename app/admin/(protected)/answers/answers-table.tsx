"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X, Pencil, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  createAnswerLibraryEntry,
  setAnswerLibraryActive,
  updateAnswerLibraryEntry,
  type AnswerLibraryEntry,
  type AnswerLibraryListFilters,
  type AnswerSport,
  type AnswerType,
} from "@/lib/cms/answer-library-actions"

const TYPE_OPTIONS: { value: AnswerType; label: string }[] = [
  { value: "player", label: "Player" },
  { value: "team", label: "Team" },
  { value: "competition", label: "Competition" },
  { value: "venue", label: "Venue" },
  { value: "other", label: "Other" },
]

const SPORT_OPTIONS: { value: AnswerSport; label: string }[] = [
  { value: "rugby", label: "Rugby" },
  { value: "gaa", label: "GAA" },
  { value: "both", label: "Both" },
]

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return value
  }
}

interface AnswersTableProps {
  initialEntries: AnswerLibraryEntry[]
  count: number
  page: number
  pageSize: number
  filters: AnswerLibraryListFilters
}

type DialogState = { mode: "create" } | { mode: "edit"; entry: AnswerLibraryEntry } | null

export default function AnswersTable({ initialEntries, count, page, pageSize, filters }: AnswersTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(filters.search ?? "")
  const [dialogState, setDialogState] = useState<DialogState>(null)
  const [rowActionError, setRowActionError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

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

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      updateParams({ q: searchInput || null })
    },
    [searchInput, updateParams],
  )

  const activeFilterCount = useMemo(() => {
    return [filters.type, filters.sport, filters.active !== "all" ? filters.active : undefined].filter(
      Boolean,
    ).length
  }, [filters])

  function clearAllFilters() {
    setSearchInput("")
    startTransition(() => {
      router.push(pathname)
    })
  }

  async function handleToggleActive(entry: AnswerLibraryEntry) {
    setRowActionError(null)
    setTogglingId(entry.id)
    const result = await setAnswerLibraryActive(entry.id, !entry.active)
    setTogglingId(null)
    if (!result.success) {
      setRowActionError(result.error ?? "Failed to update answer.")
      return
    }
    startTransition(() => router.refresh())
  }

  const rangeStart = count === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, count)

  return (
    <div className="space-y-4">
      {/* Search + Add */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-[240px] max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or alias..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>
          <Button type="submit" variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
            Search
          </Button>
        </form>
        <Button
          onClick={() => setDialogState({ mode: "create" })}
          className="bg-lime-500 text-black hover:bg-lime-400 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Answer
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          placeholder="Type"
          value={filters.type !== "all" ? filters.type : undefined}
          options={TYPE_OPTIONS}
          onChange={(v) => updateParams({ type: v })}
        />
        <FilterSelect
          placeholder="Sport"
          value={filters.sport !== "all" ? filters.sport : undefined}
          options={SPORT_OPTIONS}
          onChange={(v) => updateParams({ sport: v })}
        />
        <FilterSelect
          placeholder="Status"
          value={filters.active !== "all" ? filters.active : undefined}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          onChange={(v) => updateParams({ active: v })}
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
              <TableHead className="text-zinc-400">Answer</TableHead>
              <TableHead className="text-zinc-400">Type</TableHead>
              <TableHead className="text-zinc-400">Sport</TableHead>
              <TableHead className="text-zinc-400">Aliases</TableHead>
              <TableHead className="text-zinc-400">Times Used</TableHead>
              <TableHead className="text-zinc-400">Last Used</TableHead>
              <TableHead className="text-zinc-400">Active</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialEntries.length === 0 ? (
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableCell colSpan={8} className="text-center text-zinc-500 py-12">
                  No answers match your filters.
                </TableCell>
              </TableRow>
            ) : (
              initialEntries.map((entry) => (
                <TableRow key={entry.id} className="border-zinc-800 hover:bg-zinc-900/50 group">
                  <TableCell className="text-white text-sm font-medium">{entry.name}</TableCell>
                  <TableCell className="text-zinc-300 text-sm capitalize">{entry.type}</TableCell>
                  <TableCell className="text-zinc-300 text-sm capitalize">{entry.sport}</TableCell>
                  <TableCell className="max-w-[220px]">
                    {entry.aliases.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {entry.aliases.map((a) => (
                          <Badge key={a} variant="secondary" className="bg-zinc-800 text-zinc-300 border-0 text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">{entry.usage_count}</TableCell>
                  <TableCell className="text-zinc-300 text-sm">{formatDate(entry.last_used_at)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={entry.active}
                      disabled={togglingId === entry.id}
                      onCheckedChange={() => handleToggleActive(entry)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDialogState({ mode: "edit", entry })}
                      className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit {entry.name}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>{count === 0 ? "0 results" : `Showing ${rangeStart}–${rangeEnd} of ${count}`}</span>
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

      <AnswerDialog
        state={dialogState}
        onClose={() => setDialogState(null)}
        onSaved={() => {
          setDialogState(null)
          startTransition(() => router.refresh())
        }}
      />
    </div>
  )
}

function FilterSelect({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string
  value: string | undefined
  options: { value: string; label: string }[]
  onChange: (value: string | null) => void
}) {
  return (
    <Select value={value ?? "__all"} onValueChange={(v) => onChange(v === "__all" ? null : v)}>
      <SelectTrigger className="w-auto min-w-[120px] h-9 bg-zinc-900 border-zinc-800 text-zinc-300">
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

function AnswerDialog({
  state,
  onClose,
  onSaved,
}: {
  state: DialogState
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = state?.mode === "edit"
  const initial = isEdit ? state.entry : null

  const [name, setName] = useState(initial?.name ?? "")
  const [type, setType] = useState<AnswerType>(initial?.type ?? "player")
  const [sport, setSport] = useState<AnswerSport>(initial?.sport ?? "both")
  const [aliasesInput, setAliasesInput] = useState((initial?.aliases ?? []).join(", "))
  const [active, setActive] = useState(initial?.active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset local state whenever the dialog opens for a different entry/mode.
  const key = state ? (state.mode === "edit" ? state.entry.id : "create") : "closed"
  const [lastKey, setLastKey] = useState(key)
  if (key !== lastKey) {
    setLastKey(key)
    setName(initial?.name ?? "")
    setType(initial?.type ?? "player")
    setSport(initial?.sport ?? "both")
    setAliasesInput((initial?.aliases ?? []).join(", "))
    setActive(initial?.active ?? true)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError("Answer name is required.")
      return
    }
    setSaving(true)
    setError(null)

    const aliases = aliasesInput
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean)

    const result =
      state?.mode === "edit"
        ? await updateAnswerLibraryEntry(state.entry.id, { name, type, sport, aliases, active })
        : await createAnswerLibraryEntry({ name, type, sport, aliases, active })

    setSaving(false)

    if (!result.success) {
      setError(result.error ?? "Something went wrong.")
      return
    }

    onSaved()
  }

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit answer" : "Add answer"}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {isEdit
              ? "Update this answer's details in the shared library."
              : "Add a new answer to the shared library for use across Tenable questions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm text-zinc-300">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brian O'Driscoll"
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-zinc-300">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AnswerType)}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-800 focus:text-white">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-zinc-300">Sport</Label>
              <Select value={sport} onValueChange={(v) => setSport(v as AnswerSport)}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {SPORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-800 focus:text-white">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-zinc-300">Aliases</Label>
            <Input
              value={aliasesInput}
              onChange={(e) => setAliasesInput(e.target.value)}
              placeholder="Comma-separated, e.g. BOD, O'Driscoll"
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
            />
            <p className="text-xs text-zinc-500">Alternate spellings that should also match this answer.</p>
          </div>

          <div className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2">
            <Label className="text-sm text-zinc-300">Active</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={saving}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-lime-500 text-black hover:bg-lime-400">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add answer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
