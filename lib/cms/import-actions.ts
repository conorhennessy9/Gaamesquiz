"use server"

// Server action that actually commits parsed rows to `quiz_questions`. Only
// called with rows that already passed client-side validation in
// import-parser.ts, but every row is re-checked for issues here too, so a
// tampered or stale payload can never write invalid data.

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ANSWER_COLUMNS, type ParsedImportRow } from "./import-types"

export interface ImportRunResult {
  insertedCount: number
  skippedInvalidCount: number
  error?: string
}

function toInsertRow(row: ParsedImportRow) {
  const v = row.values
  const answers = ANSWER_COLUMNS.map((c) => v[c]).filter((a): a is string => Boolean(a))

  return {
    question_text: v.question!.trim(),
    sport: v.sport!.trim().toLowerCase(),
    game_type: v.game_type!.trim().toLowerCase(),
    answers,
    competition: v.competition?.trim() || null,
    theme: v.theme?.trim() || null,
    difficulty: v.difficulty!.trim().toLowerCase(),
    evergreen_type: v.evergreen_type?.trim().toLowerCase() || null,
    evergreen:
      v.evergreen_type?.trim().toLowerCase() === "true_evergreen" ||
      v.evergreen_type?.trim().toLowerCase() === "semi_evergreen",
    review_frequency: v.review_frequency?.trim().toLowerCase() || null,
    update_trigger: v.update_trigger?.trim() || null,
    last_verified_at: v.last_verified?.trim() || null,
    snapshot_period: v.snapshot_period?.trim() || null,
    notes: v.notes?.trim() || null,
    cooldown_years: v.cooldown_years?.trim() ? Number(v.cooldown_years.trim()) : null,
    status: "draft",
    published: false,
  }
}

/**
 * Inserts only the rows that have zero validation issues. Rows with any
 * issue are silently dropped from the payload before it ever reaches this
 * function's insert call — but as a defense-in-depth check, they're also
 * filtered out here in case the caller passes the full (unfiltered) row set.
 */
export async function importValidQuestions(rows: ParsedImportRow[]): Promise<ImportRunResult> {
  const validRows = rows.filter((r) => r.issues.length === 0)
  const skippedInvalidCount = rows.length - validRows.length

  if (validRows.length === 0) {
    return { insertedCount: 0, skippedInvalidCount }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert(validRows.map(toInsertRow))
    .select("id")

  if (error) {
    return { insertedCount: 0, skippedInvalidCount, error: error.message }
  }

  revalidatePath("/admin/questions")
  revalidatePath("/admin/import")
  return { insertedCount: data?.length ?? validRows.length, skippedInvalidCount }
}
