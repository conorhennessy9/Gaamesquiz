"use server"

import { fetchQuestionsFromSheet, type SheetConfig } from "@/lib/google-sheets"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface SyncResult {
  success: boolean
  message: string
  added: number
  updated: number
  skipped: number
  errors: string[]
}

/**
 * Sync questions from Google Sheets to the database
 * @param gameType - The type of game (rugby-tenable, rugby-clock, gaa-tenable, gaa-clock)
 * @param config - Google Sheets configuration
 * @param updateExisting - Whether to update existing questions (default: false)
 */
export async function syncQuestionsFromSheet(
  gameType: 'rugby-tenable' | 'rugby-clock' | 'gaa-tenable' | 'gaa-clock',
  config: SheetConfig,
  updateExisting: boolean = false
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    message: '',
    added: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  try {
    // Fetch questions from Google Sheets
    const questions = await fetchQuestionsFromSheet(config)

    if (questions.length === 0) {
      result.success = false
      result.message = 'No questions found in the sheet'
      return result
    }

    console.log(`[v0] Processing ${questions.length} questions for ${gameType}`)

    // Determine the table name
    const tableName = getTableName(gameType)
    const supabase = createSupabaseServerAdminClient()

    // Process each question
    for (const question of questions) {
      try {
        // Check if question exists for this date
        const { data: existingQuestion } = await supabase
          .from(tableName)
          .select('id, question_text, answers')
          .eq('question_date', question.date)
          .maybeSingle()

        if (existingQuestion) {
          if (updateExisting) {
            // Update existing question
            const { error } = await supabase
              .from(tableName)
              .update({
                question_text: question.questionText,
                answers: question.answers,
              })
              .eq('id', existingQuestion.id)

            if (error) {
              result.errors.push(`Error updating question for ${question.date}: ${error.message}`)
            } else {
              result.updated++
            }
          } else {
            result.skipped++
          }
        } else {
          // Insert new question
          const { error } = await supabase.from(tableName).insert({
            question_date: question.date,
            question_text: question.questionText,
            answers: question.answers,
          })

          if (error) {
            result.errors.push(`Error inserting question for ${question.date}: ${error.message}`)
          } else {
            result.added++
          }
        }
      } catch (error) {
        result.errors.push(
          `Error processing question for ${question.date}: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }

    // Set result message
    if (result.errors.length > 0) {
      result.success = false
      result.message = `Sync completed with errors. Added: ${result.added}, Updated: ${result.updated}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`
    } else {
      result.message = `Sync successful! Added: ${result.added}, Updated: ${result.updated}, Skipped: ${result.skipped}`
    }

    // Revalidate relevant paths
    revalidatePaths(gameType)

    return result
  } catch (error) {
    result.success = false
    result.message = `Failed to sync questions: ${error instanceof Error ? error.message : String(error)}`
    result.errors.push(result.message)
    return result
  }
}

/**
 * Preview questions from Google Sheets without saving to database
 */
export async function previewQuestionsFromSheet(config: SheetConfig) {
  try {
    const questions = await fetchQuestionsFromSheet(config)
    return {
      success: true,
      questions: questions.slice(0, 10), // Return first 10 for preview
      total: questions.length,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      questions: [],
      total: 0,
    }
  }
}

/**
 * Extract spreadsheet ID from Google Sheets URL
 */
export async function extractSpreadsheetId(url: string): Promise<string | null> {
  // Match various Google Sheets URL formats
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /^([a-zA-Z0-9-_]+)$/, // Just the ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

// Helper functions

function getTableName(gameType: string): string {
  switch (gameType) {
    case 'rugby-tenable':
      return 'rugby_tenaball_questions'
    case 'rugby-clock':
      return 'rugby_clock_questions'
    case 'gaa-tenable':
      return 'gaa_tenaball_questions'
    case 'gaa-clock':
      return 'gaa_clock_questions'
    default:
      throw new Error(`Unknown game type: ${gameType}`)
  }
}

function revalidatePaths(gameType: string): void {
  switch (gameType) {
    case 'rugby-tenable':
      revalidatePath('/game/rugby-tenable')
      revalidatePath('/game/rugby-tenable/admin')
      break
    case 'rugby-clock':
      revalidatePath('/game/against-the-clock')
      revalidatePath('/game/against-the-clock/admin')
      break
    case 'gaa-tenable':
      revalidatePath('/gaa/tenable')
      revalidatePath('/gaa/tenable/admin')
      break
    case 'gaa-clock':
      revalidatePath('/gaa/against-the-clock')
      revalidatePath('/gaa/against-the-clock/admin')
      break
  }
}
