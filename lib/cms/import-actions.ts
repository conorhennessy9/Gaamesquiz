"use server"

// Server actions for the /admin/import bulk question importer. This module
// only ever writes new rows to `quiz_questions` (the same table used by the
// question library and CMS editor) — it never updates or deletes existing
// rows, so nothing already in the library can be lost or overwritten by an
// import.

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ANSWER_COLUMNS, normalizeQuestionText, type ParsedImportRow } from "./import-types"

export interface ImportRowOutcome {
  rowNumber: number
  question: string
}

export interface ImportSkippedRow extends ImportRowOutcome {
  reason: string
}

export interface ImportErrorRow extends ImportRowOutcome {
  message: string
}

export interface ImportRunResult {
  importedCount: number
  skippedCount: number
  errorCount: number
  skipped: ImportSkippedRow[]
  errors: ImportErrorRow[]
  /** Set only for a fatal failure that stopped the whole run (e.g. couldn't reach the database). */
  fatalError?: string
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
 * Returns the subset of `normalizedTexts` that already exist (case/whitespace
 * insensitively) as `question_text` values in `quiz_questions`. Used by the
 * uploader to flag existing-library duplicates in the preview before import
 * even runs, and re-used defensively inside `importValidQuestions` itself.
 */
export async function findExistingQuestionTexts(normalizedTexts: string[]): Promise<string[]> {
  const wanted = new Set(normalizedTexts)
  if (wanted.size === 0) return []

  const supabase = await createClient()
  const { data, error } = await supabase.from("quiz_questions").select("question_text")

  if (error || !data) return []

  const matches = new Set<string>()
  for (const r of data as { question_text: string }[]) {
    const normalized = normalizeQuestionText(r.question_text)
    if (wanted.has(normalized)) matches.add(normalized)
  }
  return Array.from(matches)
}

/**
 * Commits only the rows that have zero validation issues (missing fields,
 * invalid enums, in-file duplicates, or existing-library duplicates already
 * flagged by the client). This is a pure INSERT flow — existing rows are
 * never read for the purpose of updating/deleting them, only to re-check for
 * duplicates, so nothing already in the library can be altered or removed.
 *
 * Every row is re-validated here too (defense-in-depth against a stale or
 * tampered payload): rows still carrying an issue are skipped, and the
 * existing-question and within-batch duplicate checks are re-run right
 * before insert so a race with another import can't slip a duplicate in.
 * Rows are inserted one at a time so a single bad row can't fail the whole
 * batch and so the report can attribute success/skip/error per row.
 */
export async function importValidQuestions(rows: ParsedImportRow[]): Promise<ImportRunResult> {
  const skipped: ImportSkippedRow[] = []
  const errors: ImportErrorRow[] = []

  const candidateRows = rows.filter((r) => r.issues.length === 0)
  for (const row of rows) {
    if (row.issues.length === 0) continue
    skipped.push({
      rowNumber: row.rowNumber,
      question: row.values.question ?? "(missing question)",
      reason: row.issues[0]?.message ?? "Failed validation.",
    })
  }

  if (candidateRows.length === 0) {
    return { importedCount: 0, skippedCount: skipped.length, errorCount: 0, skipped, errors }
  }

  const supabase = await createClient()

  const { data: existingData, error: existingError } = await supabase.from("quiz_questions").select("question_text")

  if (existingError) {
    return {
      importedCount: 0,
      skippedCount: skipped.length,
      errorCount: 0,
      skipped,
      errors,
      fatalError: `Could not check for existing questions: ${existingError.message}`,
    }
  }

  const existingNormalized = new Set(
    (existingData as { question_text: string }[]).map((r) => normalizeQuestionText(r.question_text)),
  )
  const seenInBatch = new Set<string>()

  let importedCount = 0

  for (const row of candidateRows) {
    const question = row.values.question ?? "(missing question)"
    const normalized = normalizeQuestionText(question)

    if (existingNormalized.has(normalized)) {
      skipped.push({ rowNumber: row.rowNumber, question, reason: "Already exists in the question library." })
      continue
    }
    if (seenInBatch.has(normalized)) {
      skipped.push({ rowNumber: row.rowNumber, question, reason: "Duplicate of another row in this file." })
      continue
    }
    seenInBatch.add(normalized)

    const { error } = await supabase.from("quiz_questions").insert(toInsertRow(row))

    if (error) {
      errors.push({ rowNumber: row.rowNumber, question, message: error.message })
      continue
    }

    importedCount += 1
  }

  if (importedCount > 0) {
    revalidatePath("/admin/questions")
    revalidatePath("/admin/import")
  }

  return {
    importedCount,
    skippedCount: skipped.length,
    errorCount: errors.length,
    skipped,
    errors,
  }
}
