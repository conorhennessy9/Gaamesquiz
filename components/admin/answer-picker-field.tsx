"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Loader2, Plus, X } from "lucide-react"
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
  venue: "Venue",
  number: "Number",
  date: "Date",
  other: "Other",
}

const TYPE_OPTIONS = Object.entries(TYPE_LABELS) as [AnswerType, string][]

interface AnswerPickerFieldProps {
  value: AnswerEntry[]
  onChange: (value: AnswerEntry[]) => void
  sport: AnswerSport | ""
  disabled?: boolean
}

export function AnswerPickerField({ value, onChange, sport, disabled }: AnswerPickerFieldProps) {
  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function addEntry(entry: AnswerEntry) {
    if (value.some((v) => v.name.toLowerCase() === entry.name.toLowerCase())) return
    onChange([...value, entry])
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((entry, index) => (
            <li
              key={`${entry.id ?? "free"}-${entry.name}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-sm text-white"
            >
              {entry.name}
              {!entry.id && <span className="text-[10px] uppercase text-zinc-500">unlinked</span>}
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeAt(index)}
                className="text-zinc-500 hover:text-white"
                aria-label={`Remove ${entry.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnswerAddButton disabled={disabled} sport={sport} onAdd={addEntry} />
    </div>
  )
}

function AnswerAddButton({
  disabled,
  sport,
  onAdd,
}: {
  disabled?: boolean
  sport: AnswerSport | ""
  onAdd: (entry: AnswerEntry) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<AnswerLibraryEntry[]>([])
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
      setLoading(false)
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, sport, open])

  const trimmedSearch = search.trim()
  const exactMatch = results.some((r) => r.name.toLowerCase() === trimmedSearch.toLowerCase())

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
      onAdd({ id: result.id, name: trimmedSearch })
      setSearch("")
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Add answer
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 bg-zinc-900 border-zinc-800 text-white">
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
                        onAdd({ id: entry.id, name: entry.name })
                        setSearch("")
                        setOpen(false)
                      }}
                      className="focus:bg-zinc-800 focus:text-white"
                    >
                      <Check className="h-4 w-4 opacity-0" />
                      <span className="flex-1 truncate">{entry.name}</span>
                      <span className="text-[10px] uppercase text-zinc-500">{TYPE_LABELS[entry.type]}</span>
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
