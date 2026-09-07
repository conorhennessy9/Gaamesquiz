"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Loader2, Pencil, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  createAnswerLibraryEntry,
  searchAnswerLibrary,
  type AnswerLibraryEntry,
  type AnswerSport,
  type AnswerType,
} from "@/lib/cms/answer-library-actions"
import type { AnswerEntry } from "@/lib/cms/question-form-types"

const TYPE_LABELS: Record<AnswerType, string> = {
  player: "Player",
  team: "Team",
  competition: "Competition",
  venue: "Venue",
  other: "Other",
}

const TYPE_OPTIONS = Object.entries(TYPE_LABELS) as [AnswerType, string][]

interface AnswerPickerFieldProps {
  value: AnswerEntry[]
  onChange: (value: AnswerEntry[]) => void
  sport: AnswerSport | ""
  disabled?: boolean
}

/**
 * Renders one numbered slot per accepted answer ("Answer 1", "Answer 2", ...)
 * plus a button to add another slot. Each slot is an independent search
 * against the answer library — selecting a result only ever links that
 * exact record (no fuzzy matching or merging of distinct answers).
 */
export function AnswerPickerField({ value, onChange, sport, disabled }: AnswerPickerFieldProps) {
  function updateAt(index: number, entry: AnswerEntry) {
    onChange(value.map((v, i) => (i === index ? entry : v)))
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function addSlot() {
    onChange([...value, { id: null, name: "" }])
  }

  return (
    <div className="space-y-2">
      {value.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-xs text-zinc-500">Answer {index + 1}</span>
          <div className="flex-1">
            <AnswerSlotSearch
              value={entry}
              onChange={(next) => updateAt(index, next)}
              sport={sport}
              disabled={disabled}
            />
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => removeAt(index)}
            className="text-zinc-500 hover:text-white shrink-0"
            aria-label={`Remove answer ${index + 1}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={addSlot}
        className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
      >
        <Plus className="h-4 w-4" />
        Add answer slot
      </Button>
    </div>
  )
}

function AnswerSlotSearch({
  value,
  onChange,
  sport,
  disabled,
}: {
  value: AnswerEntry
  onChange: (entry: AnswerEntry) => void
  sport: AnswerSport | ""
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<AnswerLibraryEntry[]>([])
  const [resultTypes, setResultTypes] = useState<Map<string, AnswerType>>(new Map())
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newType, setNewType] = useState<AnswerType>("player")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const data = await searchAnswerLibrary(search, sport || undefined)
      setResults(data)
      setResultTypes(new Map(data.map((r) => [r.id, r.type])))
      setLoading(false)
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, sport, open])

  const trimmedSearch = search.trim()
  const exactMatch = results.some((r) => r.name.toLowerCase() === trimmedSearch.toLowerCase())
  const isFilled = value.name.trim().length > 0

  async function handleCreate() {
    if (!trimmedSearch || creating) return
    setCreating(true)
    const result = await createAnswerLibraryEntry({
      name: trimmedSearch,
      type: newType,
      sport: sport || "both",
      aliases: [],
      active: true,
    })
    setCreating(false)

    if (result.success && result.id) {
      onChange({ id: result.id, name: trimmedSearch })
      setSearch("")
      setOpen(false)
    }
  }

  if (isFilled && !open) {
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-sm text-white">
        <span className="flex-1 truncate">{value.name}</span>
        {!value.id && <span className="text-[10px] uppercase text-zinc-500">unlinked</span>}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setSearch(value.name)
            setOpen(true)
          }}
          className="text-zinc-500 hover:text-white"
          aria-label={`Change answer ${value.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-start border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          Search the answer library...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 bg-zinc-900 border-zinc-800 text-white" align="start">
        <Command shouldFilter={false} className="bg-zinc-900">
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search the answer library..."
            className="text-white"
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching...
              </div>
            ) : (
              <>
                <CommandEmpty className="py-4 text-sm text-zinc-500">No matches.</CommandEmpty>
                <CommandGroup>
                  {results.map((entry) => (
                    <CommandItem
                      key={entry.id}
                      value={entry.id}
                      onSelect={() => {
                        onChange({ id: entry.id, name: entry.name })
                        setSearch("")
                        setOpen(false)
                      }}
                      className="focus:bg-zinc-800 focus:text-white"
                    >
                      <Check className={cn("h-4 w-4", value.id === entry.id ? "opacity-100" : "opacity-0")} />
                      <span className="flex-1 truncate">{entry.name}</span>
                      <span className="text-[10px] uppercase text-zinc-500">
                        {TYPE_LABELS[resultTypes.get(entry.id) ?? entry.type]}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {trimmedSearch && !exactMatch && !loading && (
              <div className="border-t border-zinc-800 p-2 space-y-2">
                <p className="text-xs text-zinc-500">
                  Create &quot;<span className="text-white">{trimmedSearch}</span>&quot; as a new answer
                </p>
                <div className="flex items-center gap-2">
                  <Select value={newType} onValueChange={(v) => setNewType(v as AnswerType)}>
                    <SelectTrigger className="h-8 flex-1 bg-zinc-950 border-zinc-800 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      {TYPE_OPTIONS.map(([v, label]) => (
                        <SelectItem key={v} value={v} className="focus:bg-zinc-800 focus:text-white text-xs">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    disabled={creating}
                    onClick={handleCreate}
                    className={cn("h-8 bg-lime-500 text-black hover:bg-lime-400 shrink-0")}
                  >
                    {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Create
                  </Button>
                </div>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
