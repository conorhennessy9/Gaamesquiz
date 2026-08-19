"use server"

import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface GAAClockQuestion {
  id: number
  question_text: string
  answers: string[]
  question_date: string
  created_at?: string
}

export async function getGAAClockQuestions(): Promise<GAAClockQuestion[]> {
  const supabase = await createSupabaseServerAdminClient()
  const { data, error } = await supabase
    .from("gaa_clock_questions")
    .select("*")
    .order("question_date", { ascending: true })

  if (error) {
    console.error("Error fetching GAA clock questions:", error)
    return []
  }

  return data.map((q) => ({ ...q, question_date: q.question_date as string })) as GAAClockQuestion[]
}

export async function getGAAClockQuestionByDate(date: string): Promise<GAAClockQuestion | null> {
  const supabase = await createSupabaseServerAdminClient()
  const { data, error } = await supabase.from("gaa_clock_questions").select("*").eq("question_date", date).maybeSingle()

  if (error) {
    console.error(`Error fetching GAA clock question for date ${date}:`, error)
    return null
  }
  if (!data) return null
  return { ...data, question_date: data.question_date as string } as GAAClockQuestion
}

export async function createGAAClockQuestion(
  questionData: Omit<GAAClockQuestion, "id" | "created_at">,
): Promise<{ success: boolean; error?: string; data?: GAAClockQuestion }> {
  const supabase = await createSupabaseServerAdminClient()

  // Check if a question for this date already exists
  const { data: existingQuestion, error: fetchError } = await supabase
    .from("gaa_clock_questions")
    .select("id")
    .eq("question_date", questionData.question_date)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error checking for existing question:", fetchError)
    return { success: false, error: fetchError.message }
  }
  if (existingQuestion) {
    return { success: false, error: `A question for date ${questionData.question_date} already exists.` }
  }

  const { data, error } = await supabase
    .from("gaa_clock_questions")
    .insert([
      {
        question_text: questionData.question_text,
        answers: questionData.answers,
        question_date: questionData.question_date,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating GAA clock question:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/gaa/against-the-clock/admin")
  revalidatePath("/gaa/against-the-clock")
  return { success: true, data: { ...data, question_date: data.question_date as string } as GAAClockQuestion }
}

export async function updateGAAClockQuestion(
  id: number,
  questionData: Partial<Omit<GAAClockQuestion, "id" | "created_at">>,
): Promise<{ success: boolean; error?: string; data?: GAAClockQuestion }> {
  const supabase = await createSupabaseServerAdminClient()

  // If question_date is being updated, check for conflicts
  if (questionData.question_date) {
    const { data: conflictingQuestion, error: fetchError } = await supabase
      .from("gaa_clock_questions")
      .select("id")
      .eq("question_date", questionData.question_date)
      .not("id", "eq", id)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking for conflicting date:", fetchError)
      return { success: false, error: fetchError.message }
    }
    if (conflictingQuestion) {
      return { success: false, error: `Another question already exists for date ${questionData.question_date}.` }
    }
  }

  const updatePayload: { question_text?: string; answers?: string[]; question_date?: string } = {}
  if (questionData.question_text !== undefined) updatePayload.question_text = questionData.question_text
  if (questionData.answers !== undefined) updatePayload.answers = questionData.answers
  if (questionData.question_date !== undefined) updatePayload.question_date = questionData.question_date

  const { data, error } = await supabase
    .from("gaa_clock_questions")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating GAA clock question:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/gaa/against-the-clock/admin")
  revalidatePath("/gaa/against-the-clock")
  return { success: true, data: { ...data, question_date: data.question_date as string } as GAAClockQuestion }
}

export async function deleteGAAClockQuestion(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerAdminClient()
  const { error } = await supabase.from("gaa_clock_questions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting GAA clock question:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/gaa/against-the-clock/admin")
  revalidatePath("/gaa/against-the-clock")
  return { success: true }
}
