"use client"

import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerFieldProps {
  value: string // yyyy-MM-dd or ""
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

function formatDate(value: string): string {
  const date = parseDate(value)
  if (!date) return ""
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function DatePickerField({ value, onChange, placeholder = "Pick a date", disabled, id }: DatePickerFieldProps) {
  const selected = parseDate(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-start gap-2 bg-zinc-900 border-zinc-800 text-left font-normal hover:bg-zinc-800"
        >
          <CalendarIcon className="h-4 w-4 text-zinc-500" />
          <span className={cn(!value && "text-zinc-500")}>{value ? formatDate(value) : placeholder}</span>
          {value && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onChange("")
              }}
              className="ml-auto text-zinc-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date: Date | undefined) => onChange(date ? toISODate(date) : "")}
          className="text-white"
        />
      </PopoverContent>
    </Popover>
  )
}
