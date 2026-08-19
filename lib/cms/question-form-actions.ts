"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { QuizQuestion } from "./types"
import type { AnswerEntry, QuestionFormValues, FormOptions, SaveResult } from "./question-form-types"
import { touchAnswerLibraryUsage } from "./answer-library-actions"

// Server actions for the Add/Edit Question editor (/admin/questions/new and
// /admin/questions/[id]/edit). Reads and writes the `quiz_questions` table
// only — no per-sport gameplay table (rugby_tenaball_questions,
// gaa_tenaball_questions, rugby_clock_questions, gaa_clock_questions) is
// touched, so public game functionality is unaffected.
//
// NOTE: this file has the "use server" directive, so it may only export
// async functions. Shared types/constants live in ./question-form-types.

const SEED_COMPETITIONS = [
  "Six Nations",
  "Rugby World Cup",
  "Champions Cup",
  "URC (United Rugby Championship)",
  "Premiership Rugby",
  "Top 14",
  "All-Ireland Senior Football Championship",
  "All-Ireland Senior Hurling Championship",
  "National Football League (GAA)",
  "National Hurling League",
  "Sigerson Cup",
  "Club Championship",
]

const SEED_THEMES = [
  "Players",
  "Teams",
  "Stadiums",
  "History",
  "Records",
  "Trophies",
  "Provinces",
  "Internationals",
  "Clubs",
  "Managers",
  "General",
]

export async function getFormOptions(): Promise<FormOptions> {
  const supabase = await createClient()

  const [competitionRes, themeRes, rugbyBankRes, gaaBankRes] = await Promise.all([
    supabase.from("quiz_questions").select("competition").not("competition", "is", null),
    supabase.from("quiz_questions").select("theme").not("theme", "is", null),
    supabase.from("rugby_answer_bank").select("category").not("category", "is", null),
    supabase.from("gaa_answer_bank").select("category").not("category", "is", null),
  ])

  const existingCompetitions = (competitionRes.data ?? []).map((r: any) => r.competition as string)
  const existingThemes = (themeRes.data ?? []).map((r: any) => r.theme as string)
  const bankCategories = [...(rugbyBankRes.data ?? []), ...(gaaBankRes.data ?? [])].map(
    (r: any) => r.category as string,
  )

  const competitions = Array.from(new Set([...SEED_COMPETITIONS, ...existingCompetitions])).sort()
  const themes = Array.from(
    new Set([...SEED_THEMES, ...existingThemes, ...bankCategories.map(capitalize)]),
  ).sort()

  return { competitions, themes }
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export async function getQuestionForEdit(
  id: number,
): Promise<{ question: QuizQuestion; formValues: QuestionFormValues } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("quiz_questions").select("*").eq("id", id).single()

  if (error || !data) return null

  const q = data as QuizQuestion & {
    competition?: string | null
    evergreen_type?: string | null
    review_frequency?: string | null
    update_trigger?: string | null
    last_verified_at?: string | null
    snapshot_period?: string | null
    notes?: string | null
    cooldown_years?: number | null
    scheduled_position?: number | null
  }

  // Reconstruct answer_entries by matching stored answer names back to
  // answer_library rows (case-insensitive). Names with no match are kept as
  // unlinked free-text entries (id: null) so nothing is silently dropped.
  const storedAnswers = Array.isArray(q.answers) ? q.answers : []
  let answerEntries: AnswerEntry[] = storedAnswers.map((name) => ({ id: null, name }))

  if (storedAnswers.length > 0) {
    const { data: libraryMatches } = await supabase
      .from("answer_library")
      .select("id, name")
      .in(
        "name",
        // Postgres `in` matches exact values; also try lowercased dedupe below.
        storedAnswers,
      )

    if (libraryMatches && libraryMatches.length > 0) {
      const byLowerName = new Map(libraryMatches.map((m: any) => [m.name.toLowerCase(), m.id as string]))
      answerEntries = storedAnswers.map((name) => ({
        id: byLowerName.get(name.toLowerCase()) ?? null,
        name,
      }))
    }
  }

  const formValues: QuestionFormValues = {
    question_text: q.question_text ?? "",
    sport: q.sport ?? "",
    competition: q.competition ?? "",
    theme: q.theme ?? "",
    game_type: q.game_type ?? "",
    answer_entries: answerEntries,
    difficulty: (q.difficulty as any) ?? "",
    evergreen_type: (q.evergreen_type as any) ?? "",
    review_frequency: (q.review_frequency as any) ?? "",
    update_trigger: q.update_trigger ?? "",
    last_verified_at: q.last_verified_at ?? "",
    snapshot_period: q.snapshot_period ?? "",
    notes: q.notes ?? "",
    cooldown_years: q.cooldown_years ? (String(q.cooldown_years) as any) : "",
    scheduled_date: q.question_date ?? "",
    scheduled_position: q.scheduled_position != null ? String(q.scheduled_position) : "",
    status: (q.status as any) ?? "draft",
  }

  return { question: q as QuizQuestion, formValues }
}

function validate(values: QuestionFormValues): SaveResult["fieldErrors"] {
  const errors: SaveResult["fieldErrors"] = {}
  if (!values.question_text.trim()) errors.question_text = "Question text is required."
  if (!values.sport) errors.sport = "Sport is required."
  if (!values.game_type) errors.game_type = "Game type is required."
  if (!values.difficulty) errors.difficulty = "Difficulty is required."
  if (!values.status) errors.status = "Status is required."
  if (values.scheduled_position && !/^\d+$/.test(values.scheduled_position)) {
    errors.scheduled_position = "Scheduled position must be a whole number."
  }
  return errors
}

function toRow(values: QuestionFormValues) {
  return {
    question_text: values.question_text.trim(),
    sport: values.sport,
    game_type: values.game_type,
    answers: values.answer_entries.map((e) => e.name),
    competition: values.competition.trim() || null,
    theme: values.theme.trim() || null,
    difficulty: values.difficulty || null,
    evergreen_type: values.evergreen_type || null,
    evergreen: values.evergreen_type === "true_evergreen" || values.evergreen_type === "semi_evergreen",
    review_frequency: values.review_frequency || null,
    update_trigger: values.update_trigger.trim() || null,
    last_verified_at: values.last_verified_at || null,
    snapshot_period: values.snapshot_period.trim() || null,
    notes: values.notes.trim() || null,
    cooldown_years: values.cooldown_years ? Number(values.cooldown_years) : null,
    question_date: values.scheduled_date || null,
    scheduled_position: values.scheduled_position ? Number(values.scheduled_position) : null,
    status: values.status,
    published: values.status === "published",
  }
}

export async function createQuestion(values: QuestionFormValues): Promise<SaveResult> {
  const fieldErrors = validate(values)
  if (Object.keys(fieldErrors ?? {}).length > 0) {
    return { success: false, fieldErrors, error: "Please fix the highlighted fields." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from("quiz_questions").insert(toRow(values)).select("id").single()

  if (error) {
    return { success: false, error: error.message }
  }

  const linkedAnswerIds = values.answer_entries.map((e) => e.id).filter((id): id is string => id !== null)
  await touchAnswerLibraryUsage(linkedAnswerIds)

  revalidatePath("/admin/questions")
  return { success: true, id: data.id }
}

export async function updateQuestion(id: number, values: QuestionFormValues): Promise<SaveResult> {
  const fieldErrors = validate(values)
  if (Object.keys(fieldErrors ?? {}).length > 0) {
    return { success: false, fieldErrors, error: "Please fix the highlighted fields." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("quiz_questions").update(toRow(values)).eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  const linkedAnswerIds = values.answer_entries.map((e) => e.id).filter((id): id is string => id !== null)
  await touchAnswerLibraryUsage(linkedAnswerIds)

  revalidatePath("/admin/questions")
  revalidatePath(`/admin/questions/${id}/edit`)
  return { success: true, id }
}
