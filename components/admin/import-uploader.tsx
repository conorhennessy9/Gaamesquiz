"use client"

import { useCallback, useRef, useState } from "react"
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { applyExistingDuplicateCheck, parseImportFile } from "@/lib/cms/import-parser"
import { findExistingQuestionTexts, importValidQuestions, type ImportRunResult } from "@/lib/cms/import-actions"
import {
  ANSWER_COLUMNS,
  IMPORT_COLUMNS,
  ISSUE_LABELS,
  normalizeQuestionText,
  type ImportParseResult,
} from "@/lib/cms/import-types"

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx"]
const PREVIEW_ROW_LIMIT = 25

export default function ImportUploader() {
  const [result, setResult] = useState<ImportParseResult | null>(null)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportRunResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    const lower = file.name.toLowerCase()
    if (!ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      setError("Unsupported file type. Please upload a .csv or .xlsx file.")
      setResult(null)
      return
    }

    setParsing(true)
    setError(null)
    setResult(null)
    setImportResult(null)

    try {
      const parsed = await parseImportFile(file)

      // Cross-check every candidate question against what's already in the
      // question library, so existing-duplicate rows are flagged in the
      // preview (and excluded from the valid count) before import even runs.
      const questionTexts = Array.from(
        new Set(
          parsed.rows
            .filter((r) => r.values.question)
            .map((r) => normalizeQuestionText(r.values.question!)),
        ),
      )
      const existing = questionTexts.length > 0 ? await findExistingQuestionTexts(questionTexts) : []
      const checked = applyExistingDuplicateCheck(parsed, existing)

      setResult(checked)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse the file.")
    } finally {
      setParsing(false)
    }
  }, [])

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function reset() {
    setResult(null)
    setError(null)
    setImportResult(null)
  }

  async function handleImport() {
    if (!result) return
    setImporting(true)
    try {
      const outcome = await importValidQuestions(result.rows)
      setImportResult(outcome)
    } finally {
      setImporting(false)
    }
  }

  const rowsWithIssues = result?.rows.filter((r) => r.issues.length > 0).length ?? 0
  const canImport = Boolean(
    result && !importResult && result.missingRequiredColumns.length === 0 && result.summary.valid > 0,
  )

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors cursor-pointer ${
          dragActive ? "border-lime-500 bg-lime-500/5" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          aria-label="Upload question file"
          className="sr-only"
          onChange={onInputChange}
        />
        {parsing ? (
          <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
        ) : (
          <UploadCloud className="h-8 w-8 text-zinc-500" />
        )}
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">
            {parsing ? "Parsing file..." : "Drop a CSV or XLSX file here, or click to browse"}
          </p>
          <p className="text-xs text-zinc-500">Supported formats: .csv, .xlsx</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-900/50 bg-red-950/30">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Could not parse file</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <FileSpreadsheet className="h-5 w-5 text-zinc-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{result.fileName}</p>
              <p className="text-xs text-zinc-500">
                {result.fileType.toUpperCase()} · {result.rows.length} data row{result.rows.length === 1 ? "" : "s"}
                {result.skippedBlankRowCount > 0 &&
                  ` · ${result.skippedBlankRowCount} blank row${result.skippedBlankRowCount === 1 ? "" : "s"} skipped`}
              </p>
            </div>
          </div>

          {result.missingRequiredColumns.length > 0 && (
            <Alert variant="destructive" className="border-red-900/50 bg-red-950/30">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Missing required column{result.missingRequiredColumns.length === 1 ? "" : "s"}</AlertTitle>
              <AlertDescription>
                The file is missing: {result.missingRequiredColumns.join(", ")}. Import cannot proceed until this
                column is present.
              </AlertDescription>
            </Alert>
          )}

          {!importResult && (
            <SummaryLine
              totalDetected={result.summary.totalDetected}
              valid={result.summary.valid}
              issueCounts={result.summary.issueCounts}
            />
          )}

          {importResult && <ImportReport importResult={importResult} />}

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">Column recognition</h3>
            <div className="flex flex-wrap gap-2">
              {result.columnMappings
                .filter((m) => m.rawHeader.trim() !== "")
                .map((mapping) => (
                  <Badge
                    key={mapping.index}
                    variant="outline"
                    className={
                      mapping.column
                        ? "border-lime-800/60 bg-lime-950/30 text-lime-300 gap-1.5"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 gap-1.5"
                    }
                  >
                    {mapping.column ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3 text-zinc-500" />
                    )}
                    {mapping.rawHeader}
                    {mapping.column && mapping.column !== normalizeForDisplay(mapping.rawHeader) && (
                      <span className="text-lime-500/70">→ {mapping.column}</span>
                    )}
                  </Badge>
                ))}
            </div>
            {result.unrecognizedHeaders.length > 0 && (
              <p className="text-xs text-zinc-500">
                Unrecognized columns are ignored: {result.unrecognizedHeaders.join(", ")}
              </p>
            )}
            <p className="text-xs text-zinc-500">
              Recognized {result.recognizedColumns.length} of {IMPORT_COLUMNS.length} known columns.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Preview</h3>
              {result.rows.length > PREVIEW_ROW_LIMIT && (
                <span className="text-xs text-zinc-500">
                  Showing first {PREVIEW_ROW_LIMIT} of {result.rows.length} rows
                </span>
              )}
            </div>
            <ScrollArea className="w-full rounded-lg border border-zinc-800">
              <div className="max-h-[480px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-zinc-950">
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400 whitespace-nowrap">Row</TableHead>
                      <TableHead className="text-zinc-400 whitespace-nowrap">Question</TableHead>
                      <TableHead className="text-zinc-400 whitespace-nowrap">Answers</TableHead>
                      <TableHead className="text-zinc-400 whitespace-nowrap">Sport</TableHead>
                      <TableHead className="text-zinc-400 whitespace-nowrap">Game Type</TableHead>
                      <TableHead className="text-zinc-400 whitespace-nowrap">Theme</TableHead>
                      <TableHead className="text-zinc-400 whitespace-nowrap">Difficulty</TableHead>
                      <TableHead className="text-zinc-400 whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rows.slice(0, PREVIEW_ROW_LIMIT).map((row) => {
                      const answers = ANSWER_COLUMNS.map((col) => row.values[col])
                        .filter(Boolean)
                        .join(", ")
                      return (
                        <TableRow key={row.rowNumber} className="border-zinc-800">
                          <TableCell className="text-zinc-500 text-xs">{row.rowNumber}</TableCell>
                          <TableCell className="text-zinc-200 text-sm max-w-[280px] truncate">
                            {row.values.question || <span className="text-zinc-600">—</span>}
                          </TableCell>
                          <TableCell className="text-zinc-300 text-sm max-w-[220px] truncate">
                            {answers || <span className="text-zinc-600">—</span>}
                          </TableCell>
                          <TableCell className="text-zinc-300 text-sm">
                            {row.values.sport || <span className="text-zinc-600">—</span>}
                          </TableCell>
                          <TableCell className="text-zinc-300 text-sm">
                            {row.values.game_type || <span className="text-zinc-600">—</span>}
                          </TableCell>
                          <TableCell className="text-zinc-300 text-sm">
                            {row.values.theme || <span className="text-zinc-600">—</span>}
                          </TableCell>
                          <TableCell className="text-zinc-300 text-sm">
                            {row.values.difficulty || <span className="text-zinc-600">—</span>}
                          </TableCell>
                          <TableCell>
                            {row.issues.length > 0 ? (
                              <Badge
                                variant="outline"
                                className="border-amber-800/60 bg-amber-950/30 text-amber-300 gap-1 whitespace-nowrap"
                                title={row.issues.map((i) => i.message).join(" · ")}
                              >
                                <AlertTriangle className="h-3 w-3" />
                                {row.issues[0].message}
                                {row.issues.length > 1 ? ` (+${row.issues.length - 1})` : ""}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-lime-800/60 bg-lime-950/30 text-lime-300 gap-1"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                OK
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              {importResult
                ? "Import finished. Only valid, non-duplicate rows were written to the question library."
                : `${result.summary.valid} of ${result.summary.totalDetected} row${result.summary.totalDetected === 1 ? "" : "s"} will be imported as drafts. Invalid or duplicate rows are skipped automatically.`}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                onClick={reset}
                disabled={importing}
                className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </Button>
              {!importResult && (
                <Button
                  onClick={handleImport}
                  disabled={!canImport || importing}
                  className="bg-lime-500 text-zinc-950 hover:bg-lime-400 disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    `Import ${result.summary.valid} Valid Question${result.summary.valid === 1 ? "" : "s"}`
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryLine({
  totalDetected,
  valid,
  issueCounts,
}: {
  totalDetected: number
  valid: number
  issueCounts: ImportParseResult["summary"]["issueCounts"]
}) {
  const parts: string[] = [`${totalDetected} question${totalDetected === 1 ? "" : "s"} detected`, `${valid} valid`]

  for (const [code, count] of Object.entries(issueCounts)) {
    if (!count) continue
    const label = ISSUE_LABELS[code as keyof typeof ISSUE_LABELS]
    parts.push(`${count} ${count === 1 ? label.singular : label.plural}`)
  }

  const hasIssues = totalDetected - valid > 0

  return (
    <Alert
      className={
        hasIssues
          ? "border-amber-900/50 bg-amber-950/20 text-amber-200"
          : "border-lime-900/50 bg-lime-950/20 text-lime-200"
      }
    >
      {hasIssues ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      <AlertTitle>{parts.join(" · ")}</AlertTitle>
      <AlertDescription className={hasIssues ? "text-amber-300/80" : "text-lime-300/80"}>
        Invalid and duplicate rows are shown below and will be skipped — nothing invalid reaches the database.
      </AlertDescription>
    </Alert>
  )
}

function ImportReport({ importResult }: { importResult: ImportRunResult }) {
  return (
    <div className="space-y-3">
      <Alert
        className={
          importResult.fatalError
            ? "border-red-900/50 bg-red-950/30 text-red-200"
            : "border-lime-900/50 bg-lime-950/20 text-lime-200"
        }
      >
        {importResult.fatalError ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        <AlertTitle>
          {importResult.importedCount} imported · {importResult.skippedCount} skipped · {importResult.errorCount}{" "}
          error{importResult.errorCount === 1 ? "" : "s"}
        </AlertTitle>
        {importResult.fatalError && (
          <AlertDescription className="text-red-300/80">{importResult.fatalError}</AlertDescription>
        )}
      </Alert>

      {(importResult.skipped.length > 0 || importResult.errors.length > 0) && (
        <ScrollArea className="w-full rounded-lg border border-zinc-800">
          <div className="max-h-[320px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-zinc-950">
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400 whitespace-nowrap">Row</TableHead>
                  <TableHead className="text-zinc-400 whitespace-nowrap">Question</TableHead>
                  <TableHead className="text-zinc-400 whitespace-nowrap">Result</TableHead>
                  <TableHead className="text-zinc-400 whitespace-nowrap">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importResult.errors.map((row) => (
                  <TableRow key={`error-${row.rowNumber}`} className="border-zinc-800">
                    <TableCell className="text-zinc-500 text-xs">{row.rowNumber}</TableCell>
                    <TableCell className="text-zinc-200 text-sm max-w-[280px] truncate">{row.question}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-red-800/60 bg-red-950/30 text-red-300 gap-1">
                        <XCircle className="h-3 w-3" />
                        Error
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">{row.message}</TableCell>
                  </TableRow>
                ))}
                {importResult.skipped.map((row) => (
                  <TableRow key={`skipped-${row.rowNumber}`} className="border-zinc-800">
                    <TableCell className="text-zinc-500 text-xs">{row.rowNumber}</TableCell>
                    <TableCell className="text-zinc-200 text-sm max-w-[280px] truncate">{row.question}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-amber-800/60 bg-amber-950/30 text-amber-300 gap-1 whitespace-nowrap"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Skipped
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">{row.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

function normalizeForDisplay(raw: string) {
  return raw.trim().toLowerCase().replace(/[\s-]+/g, "_")
}
