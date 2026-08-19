/**
 * Google Sheets Integration Utility
 * Fetches and processes question data from Google Sheets
 */

export interface SheetQuestion {
  date: string // YYYY-MM-DD format
  questionText: string
  answers: string[]
}

export interface SheetConfig {
  spreadsheetId: string
  sheetName: string
  dateColumn: string // e.g., "A", "B", etc.
  questionColumn: string
  answersStartColumn: string
  answersEndColumn?: string
  skipRows?: number // Number of header rows to skip
}

/**
 * Parse column letter to zero-based index
 * A -> 0, B -> 1, Z -> 25, AA -> 26, etc.
 */
function columnToIndex(column: string): number {
  let index = 0
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + column.charCodeAt(i) - 65 + 1
  }
  return index - 1
}

/**
 * Fetch data from Google Sheets using the public CSV export
 * Note: This only works for publicly accessible sheets
 */
export async function fetchSheetData(spreadsheetId: string, sheetName: string): Promise<string[][] | null> {
  try {
    // Use the CSV export URL for public sheets
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
    
    const response = await fetch(url, {
      cache: 'no-store', // Always fetch fresh data
    })

    if (!response.ok) {
      console.error('Failed to fetch sheet data:', response.status, response.statusText)
      return null
    }

    const csvText = await response.text()
    
    // Parse CSV
    const rows = parseCSV(csvText)
    return rows
  } catch (error) {
    console.error('Error fetching sheet data:', error)
    return null
  }
}

/**
 * Simple CSV parser that handles quoted values
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    const row: string[] = []
    let currentValue = ''
    let insideQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          // Escaped quote
          currentValue += '"'
          i++
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field
        row.push(currentValue.trim())
        currentValue = ''
      } else {
        currentValue += char
      }
    }
    
    // Push last value
    row.push(currentValue.trim())
    rows.push(row)
  }
  
  return rows
}

/**
 * Parse date string to YYYY-MM-DD format
 * Handles various date formats
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null
  
  // Try to parse the date
  const date = new Date(dateStr)
  
  // Check if valid date
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date: ${dateStr}`)
    return null
  }
  
  // Format as YYYY-MM-DD in UTC
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Extract questions from sheet data based on configuration
 */
export function extractQuestionsFromSheet(
  sheetData: string[][],
  config: SheetConfig
): SheetQuestion[] {
  const questions: SheetQuestion[] = []
  const skipRows = config.skipRows || 1 // Default skip first row (header)
  
  const dateColIndex = columnToIndex(config.dateColumn)
  const questionColIndex = columnToIndex(config.questionColumn)
  const answersStartIndex = columnToIndex(config.answersStartColumn)
  const answersEndIndex = config.answersEndColumn 
    ? columnToIndex(config.answersEndColumn)
    : answersStartIndex + 20 // Default to 20 answer columns
  
  // Process each row (skip header rows)
  for (let i = skipRows; i < sheetData.length; i++) {
    const row = sheetData[i]
    
    // Get date
    const dateStr = row[dateColIndex]
    const date = parseDate(dateStr)
    if (!date) continue // Skip rows without valid dates
    
    // Get question text
    const questionText = row[questionColIndex]?.trim()
    if (!questionText) continue // Skip rows without questions
    
    // Get answers (collect non-empty values from answer columns)
    const answers: string[] = []
    for (let j = answersStartIndex; j <= answersEndIndex && j < row.length; j++) {
      const answer = row[j]?.trim()
      if (answer && answer !== '') {
        answers.push(answer)
      }
    }
    
    // Only add question if it has at least one answer
    if (answers.length > 0) {
      questions.push({
        date,
        questionText,
        answers,
      })
    }
  }
  
  return questions
}

/**
 * Fetch and parse questions from a Google Sheet
 */
export async function fetchQuestionsFromSheet(config: SheetConfig): Promise<SheetQuestion[]> {
  console.log('[v0] Fetching questions from Google Sheet...')
  
  const sheetData = await fetchSheetData(config.spreadsheetId, config.sheetName)
  
  if (!sheetData) {
    console.error('[v0] Failed to fetch sheet data')
    return []
  }
  
  console.log('[v0] Sheet data fetched successfully, rows:', sheetData.length)
  
  const questions = extractQuestionsFromSheet(sheetData, config)
  
  console.log('[v0] Extracted questions:', questions.length)
  
  return questions
}
