"use client"

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search } from "lucide-react"
import { searchGAAAnswers, searchRugbyAnswers, type AnswerSuggestion } from "@/lib/answer-bank-actions"

interface AnswerAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  sport: "gaa" | "rugby"
  /** If provided, the dropdown will only show answers from this list */
  allowedAnswers?: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AnswerAutocomplete({
  value,
  onChange,
  onSubmit,
  sport,
  allowedAnswers,
  placeholder = "Enter your answer...",
  disabled = false,
  className = "",
}: AnswerAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AnswerSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Select search function based on sport
  const searchFunction = sport === "gaa" ? searchGAAAnswers : searchRugbyAnswers

  // Fetch suggestions with debouncing
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 1) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoading(true)
      try {
        const q = query.trim().toLowerCase()

        if (allowedAnswers && allowedAnswers.length > 0) {
          // Show current-question answers at top, then full bank results below
          const questionMatches = allowedAnswers
            .filter((a) => a.toLowerCase().includes(q))
            .map((a, i) => ({ id: i, answer: a, usage_count: 99, category: "today" as string | undefined }))

          // Also search the full bank for additional context
          const bankResults = await searchFunction(query, 8)
          // Remove duplicates — bank entries that are already shown from the question
          const questionSet = new Set(questionMatches.map((m) => m.answer.toLowerCase()))
          const bankExtras = bankResults
            .filter((r) => !questionSet.has(r.answer.toLowerCase()))
            .slice(0, 8 - questionMatches.length)

          const merged = [...questionMatches, ...bankExtras].slice(0, 8)
          setSuggestions(merged)
          setShowSuggestions(merged.length > 0)
          setSelectedIndex(-1)
        } else {
          const results = await searchFunction(query, 8)
          setSuggestions(results)
          setShowSuggestions(results.length > 0)
          setSelectedIndex(-1)
        }
      } catch (error) {
        console.error("[v0] Error fetching suggestions:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    },
    [searchFunction, allowedAnswers]
  )

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 200)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [value, fetchSuggestions])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const selectSuggestion = (suggestion: AnswerSuggestion) => {
    onChange(suggestion.answer)
    setShowSuggestions(false)
    setSuggestions([])
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && onSubmit) {
        e.preventDefault()
        onSubmit()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex])
        } else if (onSubmit) {
          onSubmit()
        }
        break
      case "Escape":
        e.preventDefault()
        setShowSuggestions(false)
        break
    }
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text

    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return text

    return (
      <>
        {text.substring(0, index)}
        <span className="bg-amber-500/30 text-amber-300 font-semibold">
          {text.substring(index, index + query.length)}
        </span>
        {text.substring(index + query.length)}
      </>
    )
  }

  return (
    <div className="relative flex-1">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg placeholder-slate-400 focus:outline-none focus:border-amber-400 text-sm sm:text-base text-white pr-10 ${className}`}
          autoComplete="off"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${
                index === selectedIndex
                  ? "bg-slate-700 border-l-4 border-l-amber-500"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-white flex-1">
                  {highlightMatch(suggestion.answer, value)}
                </span>
                {suggestion.category === "today" ? (
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
                    today
                  </span>
                ) : suggestion.usage_count > 1 ? (
                  <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded shrink-0">
                    {suggestion.usage_count}x
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}

      {isLoading && value.length >= 1 && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
