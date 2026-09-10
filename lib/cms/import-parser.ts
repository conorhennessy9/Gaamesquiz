// Client-side CSV/XLSX parsing for the /admin/import bulk question importer.
// This module only reads and structures the file — it never writes to the
// database. Actual import/commit is a separate, not-yet-built step.

import * as XLSX from "xlsx"
import {
  ANSWER_COLUMNS,
  IMPORT_COLUMNS,
  REQUIRED_IMPORT_COLUMNS,
  type ColumnMapping,
  type ImportColumn,
  type ImportParseResult,
  type ParsedImportRow,
} from "./import-types"

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

  const workbook = XLSX.read(buffer, { type: "array", raw: false })
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

    const issues: string[] = []
    if (!values.question) {
      issues.push("Missing question text.")
    }
    const hasAnswer = ANSWER_COLUMNS.some((c) => Boolean(values[c]))
    if (!hasAnswer) {
      issues.push("No answers provided (answer_1 - answer_10 all empty).")
    }

    rows.push({
      rowNumber: i + 1,
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
  }
}
