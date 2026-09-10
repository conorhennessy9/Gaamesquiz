// Column recognition + parsing types for the /admin/import bulk question
// importer. This module only describes shapes and the recognized-column
// contract — actual file parsing lives in import-parser.ts, and there is
// deliberately no "commit to database" step yet.

/** The canonical set of columns the importer recognizes, in expected order. */
export const IMPORT_COLUMNS = [
  "question",
  "answer_1",
  "answer_2",
  "answer_3",
  "answer_4",
  "answer_5",
  "answer_6",
  "answer_7",
  "answer_8",
  "answer_9",
  "answer_10",
  "sport",
  "competition",
  "theme",
  "game_type",
  "difficulty",
  "evergreen_type",
  "review_frequency",
  "update_trigger",
  "last_verified",
  "snapshot_period",
  "cooldown_years",
  "notes",
] as const

export type ImportColumn = (typeof IMPORT_COLUMNS)[number]

/** Columns that must be present (as a header) for a file to be usable. */
export const REQUIRED_IMPORT_COLUMNS: ImportColumn[] = ["question"]

export const ANSWER_COLUMNS: ImportColumn[] = Array.from(
  { length: 10 },
  (_, i) => `answer_${i + 1}` as ImportColumn,
)

/** One column found in the uploaded file, and how it was recognized (or not). */
export interface ColumnMapping {
  /** The exact header text as it appeared in the file. */
  rawHeader: string
  /** The canonical column it was matched to, or null if unrecognized. */
  column: ImportColumn | null
  /** Zero-based index of this column in the file. */
  index: number
}

/** A single parsed data row, keyed by canonical column name (unrecognized
 * columns are dropped from `values` but still counted in stats). */
export interface ParsedImportRow {
  /** 1-based row number as it appeared in the source file (header excluded). */
  rowNumber: number
  values: Partial<Record<ImportColumn, string>>
  /** Validation issues found for this row (missing required fields, etc). */
  issues: string[]
}

export interface ImportParseResult {
  fileName: string
  fileType: "csv" | "xlsx"
  columnMappings: ColumnMapping[]
  recognizedColumns: ImportColumn[]
  unrecognizedHeaders: string[]
  missingRequiredColumns: ImportColumn[]
  rows: ParsedImportRow[]
  /** Rows that had no data in any recognized column (blank/separator rows). */
  skippedBlankRowCount: number
}

export interface ImportParseError {
  fileName: string
  message: string
}
