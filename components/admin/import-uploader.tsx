"use client"

import { useCallback, useRef, useState } from "react"
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { parseImportFile } from "@/lib/cms/import-parser"
import { ANSWER_COLUMNS, IMPORT_COLUMNS, type ImportParseResult } from "@/lib/cms/import-types"

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx"]
const PREVIEW_ROW_LIMIT = 25

export default function ImportUploader() {
  const [result, setResult] = useState<ImportParseResult | null>(null)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
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

    try {
      const parsed = await parseImportFile(file)
      setResult(parsed)
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

  const rowsWithIssues = result?.rows.filter((r) => r.issues.length > 0).length ?? 0

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

          {rowsWithIssues > 0 && result.missingRequiredColumns.length === 0 && (
            <Alert className="border-amber-900/50 bg-amber-950/20 text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{rowsWithIssues} row{rowsWithIssues === 1 ? "" : "s"} with issues</AlertTitle>
              <AlertDescription className="text-amber-300/80">
                These rows are missing a question or all answers. They&apos;re flagged in the preview below.
              </AlertDescription>
            </Alert>
          )}

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
                              >
                                <AlertTriangle className="h-3 w-3" />
                                {row.issues[0]}
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

          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <p className="text-xs text-zinc-500">
              Importing into the question library isn&apos;t available yet — this step only parses and previews the
              file.
            </p>
            <Button disabled className="bg-zinc-800 text-zinc-500 cursor-not-allowed">
              Import {result.rows.length} question{result.rows.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function normalizeForDisplay(raw: string) {
  return raw.trim().toLowerCase().replace(/[\s-]+/g, "_")
}
