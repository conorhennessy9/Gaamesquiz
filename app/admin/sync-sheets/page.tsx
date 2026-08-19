"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { syncQuestionsFromSheet, previewQuestionsFromSheet, extractSpreadsheetId } from "./actions"
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react"

export default function SyncSheetsPage() {
  const [gameType, setGameType] = useState<'rugby-tenable' | 'rugby-clock' | 'gaa-tenable' | 'gaa-clock'>('rugby-tenable')
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('https://docs.google.com/spreadsheets/d/1UlC8R0eDycz2K5lm3s0BySZDfmFUfybgv9MlpLZs2jc/edit?usp=sharing')
  const [sheetName, setSheetName] = useState('Sheet1')
  const [dateColumn, setDateColumn] = useState('A')
  const [questionColumn, setQuestionColumn] = useState('B')
  const [answersStartColumn, setAnswersStartColumn] = useState('C')
  const [answersEndColumn, setAnswersEndColumn] = useState('L')
  const [skipRows, setSkipRows] = useState('1')
  const [updateExisting, setUpdateExisting] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [previewData, setPreviewData] = useState<any>(null)

  const handlePreview = async () => {
    setIsPreviewing(true)
    setResult(null)
    setPreviewData(null)

    try {
      const spreadsheetId = await extractSpreadsheetId(spreadsheetUrl)
      
      if (!spreadsheetId) {
        setResult({
          success: false,
          message: 'Invalid Google Sheets URL or ID',
        })
        setIsPreviewing(false)
        return
      }

      const config = {
        spreadsheetId,
        sheetName,
        dateColumn: dateColumn.toUpperCase(),
        questionColumn: questionColumn.toUpperCase(),
        answersStartColumn: answersStartColumn.toUpperCase(),
        answersEndColumn: answersEndColumn.toUpperCase(),
        skipRows: parseInt(skipRows) || 1,
      }

      const preview = await previewQuestionsFromSheet(config)
      setPreviewData(preview)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to preview questions',
      })
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    setResult(null)
    setPreviewData(null)

    try {
      const spreadsheetId = await extractSpreadsheetId(spreadsheetUrl)
      
      if (!spreadsheetId) {
        setResult({
          success: false,
          message: 'Invalid Google Sheets URL or ID',
        })
        setIsLoading(false)
        return
      }

      const config = {
        spreadsheetId,
        sheetName,
        dateColumn: dateColumn.toUpperCase(),
        questionColumn: questionColumn.toUpperCase(),
        answersStartColumn: answersStartColumn.toUpperCase(),
        answersEndColumn: answersEndColumn.toUpperCase(),
        skipRows: parseInt(skipRows) || 1,
      }

      const syncResult = await syncQuestionsFromSheet(gameType, config, updateExisting)
      setResult(syncResult)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sync questions',
        errors: [String(error)],
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{'Sync Questions from Google Sheets'}</h1>
        <p className="text-muted-foreground">
          {'Import questions from Google Sheets into your database'}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{'Configuration'}</CardTitle>
          <CardDescription>
            {'Set up the connection to your Google Sheets document'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gameType">{'Game Type'}</Label>
            <Select value={gameType} onValueChange={(value: any) => setGameType(value)}>
              <SelectTrigger id="gameType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rugby-tenable">{'Rugby Tenable'}</SelectItem>
                <SelectItem value="rugby-clock">{'Rugby Against the Clock'}</SelectItem>
                <SelectItem value="gaa-tenable">{'GAA Tenable'}</SelectItem>
                <SelectItem value="gaa-clock">{'GAA Against the Clock'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spreadsheetUrl">{'Google Sheets URL or ID'}</Label>
            <Input
              id="spreadsheetUrl"
              value={spreadsheetUrl}
              onChange={(e) => setSpreadsheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
            <p className="text-xs text-muted-foreground">
              {'Note: The spreadsheet must be publicly accessible (view permissions)'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sheetName">{'Sheet Name'}</Label>
            <Input
              id="sheetName"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Sheet1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateColumn">{'Date Column'}</Label>
              <Input
                id="dateColumn"
                value={dateColumn}
                onChange={(e) => setDateColumn(e.target.value)}
                placeholder="A"
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questionColumn">{'Question Column'}</Label>
              <Input
                id="questionColumn"
                value={questionColumn}
                onChange={(e) => setQuestionColumn(e.target.value)}
                placeholder="B"
                className="uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="answersStartColumn">{'Answers Start Column'}</Label>
              <Input
                id="answersStartColumn"
                value={answersStartColumn}
                onChange={(e) => setAnswersStartColumn(e.target.value)}
                placeholder="C"
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answersEndColumn">{'Answers End Column'}</Label>
              <Input
                id="answersEndColumn"
                value={answersEndColumn}
                onChange={(e) => setAnswersEndColumn(e.target.value)}
                placeholder="L"
                className="uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skipRows">{'Skip Rows (Header)'}</Label>
            <Input
              id="skipRows"
              type="number"
              value={skipRows}
              onChange={(e) => setSkipRows(e.target.value)}
              placeholder="1"
              min="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="updateExisting"
              checked={updateExisting}
              onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
            />
            <Label htmlFor="updateExisting" className="cursor-pointer">
              {'Update existing questions (if unchecked, existing questions will be skipped)'}
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 mb-6">
        <Button onClick={handlePreview} disabled={isLoading || isPreviewing} variant="outline" className="flex-1 bg-transparent">
          {isPreviewing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {'Previewing...'}
            </>
          ) : (
            <>
              <Info className="mr-2 h-4 w-4" />
              {'Preview Questions'}
            </>
          )}
        </Button>
        <Button onClick={handleSync} disabled={isLoading || isPreviewing} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {'Syncing...'}
            </>
          ) : (
            'Sync Questions'
          )}
        </Button>
      </div>

      {previewData && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>{'Preview'}</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              {'Found '}{previewData.total}{' questions in the sheet. Showing first 10:'}
            </p>
            <div className="space-y-3">
              {previewData.questions.map((q: any, index: number) => (
                <div key={index} className="p-3 bg-muted rounded-md text-sm">
                  <div className="font-semibold">{q.date}</div>
                  <div className="mt-1">{q.questionText}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {q.answers.length}{' answers: '}{q.answers.slice(0, 3).join(', ')}
                    {q.answers.length > 3 && '...'}
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>
            <p>{result.message}</p>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="font-semibold">{'Errors:'}</p>
                {result.errors.map((error: string, index: number) => (
                  <p key={index} className="text-sm">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
