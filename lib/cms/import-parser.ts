// Client-side CSV/XLSX parsing for the /admin/import bulk question importer.
// This module only reads and structures the file — it never writes to the
// database. The commit step lives in import-actions.ts.

import * as XLSX from "xlsx"
import {
  IMPORT_COLUMNS,
  normalizeQuestionText,
  REQUIRED_IMPORT_COLUMNS,
  type ColumnMapping,
  type ImportColumn,
  type ImportIssue,
  type ImportIssueCode,
  type ImportParseResult,
  type ImportSummary,
  type ParsedImportRow,
} from "./import-types"
import { validateImportValues } from "./import-validation"

/** Normalize a raw header into a comparable key: lowercase, trim, spaces/dashes -> underscore. */
function normalizeHeader(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

// Accept a few common header variants for each canonical column so slightly
// differently-formatted spreadsheets still map correctly.
const HEADER_ALIASES: Record<string, ImportColumn> = {
  question: "question",
  question_text: "question",
  q: "question",
  sport: "sport",
  competition: "competition",
  comp: "competition",
  theme: "theme",
  category: "theme",
  monthly_category: "theme",
  thememonthly_category: "theme",
  theme_monthly_category: "theme",
  game: "game_type",
  game_type: "game_type",
  gametype: "game_type",
  type: "game_type",
  difficulty: "difficulty",
  evergreen_type: "evergreen_type",
  evergreen: "evergreen_type",
  review_frequency: "review_frequency",
  update_trigger: "update_trigger",
  trigger: "update_trigger",
  last_verified: "last_verified",
  last_verified_at: "last_verified",
  snapshot_period: "snapshot_period",
  cooldown_years: "cooldown_years",
  cooldown: "cooldown_years",
  notes: "notes",
  note: "notes",
}
for (let i = 1; i <= 10; i++) {
  HEADER_ALIASES[`answer_${i}`] = `answer_${i}` as ImportColumn
  HEADER_ALIASES[`answer${i}`] = `answer_${i}` as ImportColumn
}

function resolveColumn(rawHeader: string): ImportColumn | null {
  const normalized = normalizeHeader(rawHeader)
  const mapped = HEADER_ALIASES[normalized]
  if (mapped && IMPORT_COLUMNS.includes(mapped)) return mapped
  return null
}

function detectFileType(fileName: string): "csv" | "xlsx" {
  const lower = fileName.toLowerCase()
  if (lower.endsWith(".csv")) return "csv"
  return "xlsx"
}

/**
 * Parse an uploaded CSV or XLSX File into structured rows, mapping headers
 * to the recognized canonical columns. Does not touch the database.
 */
export async function parseImportFile(file: File): Promise<ImportParseResult> {
  const fileType = detectFileType(file.name)
  const buffer = await file.arrayBuffer()

  // cellDates + dateNF render real Excel date cells as YYYY-MM-DD instead of
  // the locale-dependent "m/d/yy" default, which would be misread as day-first.
  const workbook = XLSX.read(buffer, { type: "array", raw: false, cellDates: true, dateNF: "yyyy-mm-dd" })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    throw new Error("The file has no sheets or could not be read.")
  }
  const sheet = workbook.Sheets[firstSheetName]

  // header:1 -> array-of-arrays so we keep full control over header mapping
  // and can distinguish "missing column" from "empty cell".
  const grid = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    raw: false,
    dateNF: "yyyy-mm-dd",
    defval: "",
    blankrows: false,
  })

  if (grid.length === 0) {
    throw new Error("The file appears to be empty.")
  }

  const headerRow = grid[0].map((h) => String(h ?? ""))
  const dataRows = grid.slice(1)

  const columnMappings: ColumnMapping[] = headerRow.map((rawHeader, index) => ({
    rawHeader,
    column: resolveColumn(rawHeader),
    index,
  }))

  const recognizedColumns = Array.from(
    new Set(columnMappings.map((m) => m.column).filter((c): c is ImportColumn => c !== null)),
  )
  const unrecognizedHeaders = columnMappings.filter((m) => m.column === null && m.rawHeader.trim() !== "").map((m) => m.rawHeader)
  const missingRequiredColumns = REQUIRED_IMPORT_COLUMNS.filter((c) => !recognizedColumns.includes(c))

  const rows: ParsedImportRow[] = []
  let skippedBlankRowCount = 0

  // Tracks the first row number each normalized question text was seen at,
  // so every later occurrence can be flagged as a duplicate.
  const firstSeenAtByQuestion = new Map<string, number>()

  dataRows.forEach((rawRow, i) => {
    const values: Partial<Record<ImportColumn, string>> = {}
    let hasAnyValue = false

    for (const mapping of columnMappings) {
      if (!mapping.column) continue
      const cell = rawRow[mapping.index]
      const text = typeof cell === "string" ? cell.trim() : cell != null ? String(cell).trim() : ""
      if (text !== "") {
        values[mapping.column] = text
        hasAnyValue = true
      }
    }

    if (!hasAnyValue) {
      skippedBlankRowCount += 1
      return
    }

    const rowNumber = i + 1
    const issues = validateRow(values, rowNumber, firstSeenAtByQuestion)

    rows.push({
      rowNumber,
      values,
      issues,
    })
  })

  return {
    fileName: file.name,
    fileType,
    columnMappings,
    recognizedColumns,
    unrecognizedHeaders,
    missingRequiredColumns,
    rows,
    skippedBlankRowCount,
    summary: summarizeRows(rows),
  }
}

/** Validates a single row's values, recording the first occurrence of its
 * question text so later duplicates can be detected as rows are processed. */
function validateRow(
  values: Partial<Record<ImportColumn, string>>,
  rowNumber: number,
  firstSeenAtByQuestion: Map<string, number>,
): ImportIssue[] {
  const issues: ImportIssue[] = validateImportValues(values)

  if (values.question) {
    const normalized = normalizeQuestionText(values.question)
    const firstRow = firstSeenAtByQuestion.get(normalized)
    if (firstRow !== undefined) {
      issues.push({ code: "duplicate_question", message: `Duplicate of row ${firstRow}'s question text.` })
    } else {
      firstSeenAtByQuestion.set(normalized, rowNumber)
    }
  }

  return issues
}

/**
 * Merges the results of a database duplicate-check (a set of normalized
 * question texts that already exist in `quiz_questions`) into an already
 * parsed result, flagging any matching row with a `duplicate_existing`
 * issue and recomputing the summary. Pure function — takes the existing
 * result and the check outcome, returns a new result; never touches the
 * database itself.
 */
export function applyExistingDuplicateCheck(
  result: ImportParseResult,
  existingNormalizedQuestions: string[],
): ImportParseResult {
  const existingSet = new Set(existingNormalizedQuestions)
  if (existingSet.size === 0) return result

  const rows = result.rows.map((row) => {
    if (!row.values.question) return row
    if (row.issues.some((i) => i.code === "duplicate_existing")) return row

    const normalized = normalizeQuestionText(row.values.question)
    if (!existingSet.has(normalized)) return row

    return {
      ...row,
      issues: [
        ...row.issues,
        {
          code: "duplicate_existing" as const,
          message: "This question already exists in the question library.",
        },
      ],
    }
  })

  return { ...result, rows, summary: summarizeRows(rows) }
}

export function summarizeRows(rows: ParsedImportRow[]): ImportSummary {
  const issueCounts: Partial<Record<ImportIssueCode, number>> = {}
  let valid = 0

  for (const row of rows) {
    if (row.issues.length === 0) {
      valid += 1
      continue
    }
    for (const issue of row.issues) {
      issueCounts[issue.code] = (issueCounts[issue.code] ?? 0) + 1
    }
  }

  return {
    totalDetected: rows.length,
    valid,
    invalid: rows.length - valid,
    issueCounts,
  }
}
