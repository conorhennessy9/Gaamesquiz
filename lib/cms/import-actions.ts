"use server"

// Server actions for the /admin/import bulk question importer. This module
// only ever writes new rows to `quiz_questions` (the same table used by the
// question library and CMS editor) — it never updates or deletes existing
// rows, so nothing already in the library can be lost or overwritten by an
// import.

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { normalizeQuestionText, type ParsedImportRow } from "./import-types"
import { toQuizQuestionInsert, validateImportValues } from "./import-validation"

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

const PAGE_SIZE = 1000

/** Reads every existing question_text, paging past Supabase's default
 * 1,000-row response cap so duplicate checks never miss older questions. */
async function loadExistingNormalizedQuestions(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ texts: Set<string>; error?: string }> {
  const texts = new Set<string>()
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("question_text")
      .order("id")
      .range(from, from + PAGE_SIZE - 1)
    if (error) return { texts, error: error.message }
    for (const r of (data ?? []) as { question_text: string }[]) {
      texts.add(normalizeQuestionText(r.question_text))
    }
    if (!data || data.length < PAGE_SIZE) break
  }
  return { texts }
}

/**
 * Returns the subset of `normalizedTexts` that already exist (case/whitespace
 * insensitively) as `question_text` values in `quiz_questions`. Used by the
 * uploader to flag existing-library duplicates in the preview before import
 * even runs, and re-used defensively inside `importValidQuestions` itself.
 */
export async function findExistingQuestionTexts(
  normalizedTexts: string[],
): Promise<{ matches: string[]; error?: string }> {
  const wanted = new Set(normalizedTexts)
  if (wanted.size === 0) return { matches: [] }

  const supabase = await createClient()
  const { texts, error } = await loadExistingNormalizedQuestions(supabase)
  if (error) return { matches: [], error }

  return { matches: Array.from(wanted).filter((t) => texts.has(t)) }
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

  // Never trust the client's verdict alone: a row is a candidate only if the
  // client found no issues AND the same rules pass again on the server.
  const candidateRows: ParsedImportRow[] = []
  for (const row of rows) {
    const issues = row.issues.length > 0 ? row.issues : validateImportValues(row.values)
    if (issues.length === 0) {
      candidateRows.push(row)
      continue
    }
    skipped.push({
      rowNumber: row.rowNumber,
      question: row.values.question ?? "(missing question)",
      reason: issues.map((i) => i.message).join(" "),
    })
  }

  if (candidateRows.length === 0) {
    return { importedCount: 0, skippedCount: skipped.length, errorCount: 0, skipped, errors }
  }

  const supabase = await createClient()

  const { texts: existingNormalized, error: existingError } = await loadExistingNormalizedQuestions(supabase)

  if (existingError) {
    return {
      importedCount: 0,
      skippedCount: skipped.length,
      errorCount: 0,
      skipped,
      errors,
      fatalError: `Could not check for existing questions, so nothing was imported: ${existingError}`,
    }
  }

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

    const { error } = await supabase.from("quiz_questions").insert(toQuizQuestionInsert(row.values))

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
