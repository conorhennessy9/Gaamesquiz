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

/** Allowed values for enum-like columns, mirroring the `quiz_questions` check constraints. */
export const SPORT_VALUES = ["rugby", "gaa"] as const
export const GAME_TYPE_VALUES = ["tenable", "against_the_clock"] as const
export const DIFFICULTY_VALUES = ["easy", "medium", "hard", "expert"] as const

/** One column found in the uploaded file, and how it was recognized (or not). */
export interface ColumnMapping {
  /** The exact header text as it appeared in the file. */
  rawHeader: string
  /** The canonical column it was matched to, or null if unrecognized. */
  column: ImportColumn | null
  /** Zero-based index of this column in the file. */
  index: number
}

/** Every distinct problem a row can have. A row with zero issues is valid
 * and eligible for import; any issue at all excludes it from import. */
export type ImportIssueCode =
  | "missing_question"
  | "missing_answers"
  | "duplicate_question"
  | "missing_sport"
  | "invalid_sport"
  | "missing_game_type"
  | "invalid_game_type"
  | "missing_difficulty"
  | "invalid_difficulty"

export interface ImportIssue {
  code: ImportIssueCode
  message: string
}

/** Human-readable, pluralized label for each issue code, used in the summary line. */
export const ISSUE_LABELS: Record<ImportIssueCode, { singular: string; plural: string }> = {
  missing_question: { singular: "missing question", plural: "missing question" },
  missing_answers: { singular: "missing answer", plural: "missing answer" },
  duplicate_question: { singular: "duplicate", plural: "duplicate" },
  missing_sport: { singular: "missing sport", plural: "missing sport" },
  invalid_sport: { singular: "invalid sport", plural: "invalid sport" },
  missing_game_type: { singular: "missing game type", plural: "missing game type" },
  invalid_game_type: { singular: "invalid game type", plural: "invalid game type" },
  missing_difficulty: { singular: "missing difficulty", plural: "missing difficulty" },
  invalid_difficulty: { singular: "invalid difficulty", plural: "invalid difficulty" },
}

/** A single parsed data row, keyed by canonical column name (unrecognized
 * columns are dropped from `values` but still counted in stats). */
export interface ParsedImportRow {
  /** 1-based row number as it appeared in the source file (header excluded). */
  rowNumber: number
  values: Partial<Record<ImportColumn, string>>
  /** Validation issues found for this row. Empty array means the row is valid. */
  issues: ImportIssue[]
}

/** Aggregate counts shown above the preview table, before anything reaches Supabase. */
export interface ImportSummary {
  totalDetected: number
  valid: number
  invalid: number
  /** Count of rows carrying each issue code (a row can count toward more than one). */
  issueCounts: Partial<Record<ImportIssueCode, number>>
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
  summary: ImportSummary
}

export interface ImportParseError {
  fileName: string
  message: string
}
