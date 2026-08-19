"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Server actions for the standalone Answer Library (`answer_library` table).
// This is fully separate from the legacy per-sport `rugby_answer_bank` /
// `gaa_answer_bank` tables and the public gameplay tables — none of those are
// read or written here, so existing game functionality is unaffected.
//
// NOTE: this file has the "use server" directive, so it may only export
// async functions. Shared types live inline below since there are no
// non-function exports allowed.

export type AnswerType = "player" | "team" | "venue" | "number" | "date" | "other"
export type AnswerSport = "rugby" | "gaa" | "both"

export interface AnswerLibraryEntry {
  id: string
  name: string
  type: AnswerType
  sport: AnswerSport
  aliases: string[]
  usage_count: number
  active: boolean
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export interface AnswerLibraryInput {
  name: string
  type: AnswerType
  sport: AnswerSport
  aliases: string[]
  active: boolean
}

export interface AnswerLibraryResult {
  success: boolean
  id?: string
  error?: string
}

export interface AnswerLibraryListFilters {
  search?: string
  type?: AnswerType | "all"
  sport?: AnswerSport | "all"
  active?: "all" | "active" | "inactive"
  page?: number
  pageSize?: number
}

export interface AnswerLibraryListResult {
  entries: AnswerLibraryEntry[]
  total: number
}

/**
 * Search active answers for the question editor's answer picker.
 * Matches on name or alias, optionally scoped to a sport (rugby/gaa entries
 * plus any "both" entries are returned; omit sport to search everything).
 */
export async function searchAnswerLibrary(
  query: string,
  sport?: AnswerSport,
): Promise<AnswerLibraryEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("search_answer_library", {
    search_term: query?.trim() || null,
    filter_sport: sport ?? null,
  })

  if (error) {
    console.error("[v0] Error searching answer library:", error)
    return []
  }

  return (data ?? []) as AnswerLibraryEntry[]
}

/**
 * Create a new answer library entry. Used both from the standalone
 * /admin/answers management page and inline from the question editor's
 * "create new answer" flow.
 */
export async function createAnswerLibraryEntry(input: AnswerLibraryInput): Promise<AnswerLibraryResult> {
  const name = input.name.trim()
  if (!name) {
    return { success: false, error: "Answer name is required." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("answer_library")
    .insert({
      name,
      type: input.type,
      sport: input.sport,
      aliases: input.aliases.map((a) => a.trim()).filter(Boolean),
      active: input.active,
    })
    .select("id")
    .single()

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "An answer with this name already exists for this sport." }
    }
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/answers")
  return { success: true, id: data.id }
}

/**
 * Update an existing answer library entry.
 */
export async function updateAnswerLibraryEntry(
  id: string,
  input: AnswerLibraryInput,
): Promise<AnswerLibraryResult> {
  const name = input.name.trim()
  if (!name) {
    return { success: false, error: "Answer name is required." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("answer_library")
    .update({
      name,
      type: input.type,
      sport: input.sport,
      aliases: input.aliases.map((a) => a.trim()).filter(Boolean),
      active: input.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "An answer with this name already exists for this sport." }
    }
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/answers")
  return { success: true, id }
}

/**
 * Toggle (or explicitly set) the active flag on an answer library entry.
 */
export async function setAnswerLibraryActive(id: string, active: boolean): Promise<AnswerLibraryResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("answer_library")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/answers")
  return { success: true, id }
}

/**
 * Paginated, filterable list for the /admin/answers management page.
 */
export async function listAnswerLibrary(filters: AnswerLibraryListFilters): Promise<AnswerLibraryListResult> {
  const supabase = await createClient()
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 25
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from("answer_library").select("*", { count: "exact" })

  const search = filters.search?.trim()
  if (search) {
    query = query.or(`name.ilike.%${search}%,aliases.cs.{${search}}`)
  }
  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type)
  }
  if (filters.sport && filters.sport !== "all") {
    query = query.eq("sport", filters.sport)
  }
  if (filters.active === "active") {
    query = query.eq("active", true)
  } else if (filters.active === "inactive") {
    query = query.eq("active", false)
  }

  const { data, error, count } = await query
    .order("usage_count", { ascending: false })
    .order("name", { ascending: true })
    .range(from, to)

  if (error) {
    console.error("[v0] Error listing answer library:", error)
    return { entries: [], total: 0 }
  }

  return { entries: (data ?? []) as AnswerLibraryEntry[], total: count ?? 0 }
}

/**
 * Bump usage_count and last_used_at for a set of answer library ids.
 * Called when a question referencing these answers is saved.
 */
export async function touchAnswerLibraryUsage(answerIds: string[]): Promise<void> {
  if (answerIds.length === 0) return

  const supabase = await createClient()
  const { error } = await supabase.rpc("touch_answer_library_usage", { answer_ids: answerIds })

  if (error) {
    console.error("[v0] Error touching answer library usage:", error)
  }
}
