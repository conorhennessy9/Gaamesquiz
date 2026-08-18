"use server"

import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface RugbyClockQuestion {
  id: number
  question_text: string
  answers: string[]
  question_date: string
  created_at?: string
}

export async function getRugbyClockQuestions(): Promise<RugbyClockQuestion[]> {
  const supabase = createSupabaseServerAdminClient()
  const { data, error } = await supabase
    .from("rugby_clock_questions")
    .select("*")
    .order("question_date", { ascending: true })

  if (error) {
    console.error("Error fetching Rugby clock questions:", error)
    return []
  }

  return data.map((q) => ({ ...q, question_date: q.question_date as string })) as RugbyClockQuestion[]
}

export async function getRugbyClockQuestionByDate(date: string): Promise<RugbyClockQuestion | null> {
  const supabase = createSupabaseServerAdminClient()
  const { data, error } = await supabase
    .from("rugby_clock_questions")
    .select("*")
    .eq("question_date", date)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching Rugby clock question for date ${date}:`, error)
    return null
  }
  if (!data) return null
  return { ...data, question_date: data.question_date as string } as RugbyClockQuestion
}

export async function createRugbyClockQuestion(
  questionData: Omit<RugbyClockQuestion, "id" | "created_at">,
): Promise<{ success: boolean; error?: string; data?: RugbyClockQuestion }> {
  const supabase = createSupabaseServerAdminClient()

  // Check if a question for this date already exists
  const { data: existingQuestion, error: fetchError } = await supabase
    .from("rugby_clock_questions")
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
    .from("rugby_clock_questions")
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
    console.error("Error creating Rugby clock question:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/game/against-the-clock/admin")
  revalidatePath("/game/against-the-clock")
  return { success: true, data: { ...data, question_date: data.question_date as string } as RugbyClockQuestion }
}

export async function updateRugbyClockQuestion(
  id: number,
  questionData: Partial<Omit<RugbyClockQuestion, "id" | "created_at">>,
): Promise<{ success: boolean; error?: string; data?: RugbyClockQuestion }> {
  const supabase = createSupabaseServerAdminClient()

  // If question_date is being updated, check for conflicts
  if (questionData.question_date) {
    const { data: conflictingQuestion, error: fetchError } = await supabase
      .from("rugby_clock_questions")
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
    .from("rugby_clock_questions")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating Rugby clock question:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/game/against-the-clock/admin")
  revalidatePath("/game/against-the-clock")
  return { success: true, data: { ...data, question_date: data.question_date as string } as RugbyClockQuestion }
}

export async function deleteRugbyClockQuestion(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseServerAdminClient()
  const { error } = await supabase.from("rugby_clock_questions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting Rugby clock question:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/game/against-the-clock/admin")
  revalidatePath("/game/against-the-clock")
  return { success: true }
}
