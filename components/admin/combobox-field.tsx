"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface ComboboxFieldProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  id?: string
}

export function ComboboxField({
  value,
  onChange,
  options,
  placeholder = "Select or type to add...",
  emptyLabel = "No matches.",
  disabled,
  id,
}: ComboboxFieldProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const trimmedSearch = search.trim()
  const exactMatch = options.some((o) => o.toLowerCase() === trimmedSearch.toLowerCase())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-between bg-zinc-900 border-zinc-800 text-left font-normal hover:bg-zinc-800"
        >
          <span className={cn("truncate", !value && "text-zinc-500")}>{value || placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-zinc-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900 border-zinc-800 text-white">
        <Command shouldFilter={false} className="bg-zinc-900">
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search or type a new value..."
            className="text-white"
          />
          <CommandList>
            <CommandEmpty className="py-4 text-sm text-zinc-500">{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {value && (
                <CommandItem
                  value={`__clear-${value}`}
                  onSelect={() => {
                    onChange("")
                    setSearch("")
                    setOpen(false)
                  }}
                  className="text-zinc-500 focus:bg-zinc-800"
                >
                  Clear selection
                </CommandItem>
              )}
              {options
                .filter((o) => !trimmedSearch || o.toLowerCase().includes(trimmedSearch.toLowerCase()))
                .map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onChange(option)
                      setSearch("")
                      setOpen(false)
                    }}
                    className="focus:bg-zinc-800 focus:text-white"
                  >
                    <Check className={cn("h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                    {option}
                  </CommandItem>
                ))}
              {trimmedSearch && !exactMatch && (
                <CommandItem
                  value={`__create-${trimmedSearch}`}
                  onSelect={() => {
                    onChange(trimmedSearch)
                    setSearch("")
                    setOpen(false)
                  }}
                  className="text-lime-400 focus:bg-zinc-800 focus:text-lime-400"
                >
                  <Plus className="h-4 w-4" />
                  Add &quot;{trimmedSearch}&quot;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
