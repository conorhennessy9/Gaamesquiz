import type { RugbyTenaBallQuestion } from "./types"

/**
 * Raw shape of a `quiz_questions` row as returned by Supabase, limited to
 * the columns this adapter reads. `quiz_questions` is the shared CMS
 * question table (sport, game_type, theme, difficulty, scheduling, etc.);
 * only the fields relevant to Rugby TenaBall are declared here.
 */
export interface QuizQuestionRow {
  id: number | string
  question_date: string
  question_text: string
  answers: string[] | null
  created_at?: string | null
}

/**
 * Maps a `quiz_questions` row into the shape the existing Rugby TenaBall
 * game UI, scoring, and answer-matching logic already expect. This keeps
 * gameplay untouched while swapping the data source from the legacy
 * `rugby_tenaball_questions` table to the shared CMS table.
 */
export function mapQuizQuestionToRugbyTenaBall(row: QuizQuestionRow): RugbyTenaBallQuestion {
  return {
    id: typeof row.id === "string" ? Number(row.id) : row.id,
    question_date: row.question_date,
    question_text: row.question_text,
    answers: row.answers ?? [],
    created_at: row.created_at ?? undefined,
  }
}
