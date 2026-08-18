"use server"

import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { RugbyTenaBallQuestion } from "./types"

export async function getRugbyTenaBallQuestions(): Promise<RugbyTenaBallQuestion[]> {
  const supabase = createSupabaseServerAdminClient()
  const { data, error } = await supabase
    .from("rugby_tenaball_questions")
    .select("*")
    .order("question_date", { ascending: true }) // Order by date

  if (error) {
    console.error("Error fetching questions:", error)
    return []
  }
  // Ensure question_date is string "YYYY-MM-DD"
  return data.map((q) => ({ ...q, question_date: q.question_date as string })) as RugbyTenaBallQuestion[]
}

export async function getRugbyTenaBallQuestionByDate(date: string): Promise<RugbyTenaBallQuestion | null> {
  const supabase = createSupabaseServerAdminClient()
  const { data, error } = await supabase
    .from("rugby_tenaball_questions")
    .select("*")
    .eq("question_date", date) // Query by specific date
    .maybeSingle() // Use maybeSingle as there should be 0 or 1

  if (error) {
    console.error(`Error fetching question for date ${date}:`, error)
    return null
  }
  if (!data) return null
  return { ...data, question_date: data.question_date as string } as RugbyTenaBallQuestion
}

export async function createRugbyTenaBallQuestion(
  questionData: Omit<RugbyTenaBallQuestion, "id" | "created_at">,
): Promise<{ success: boolean; error?: string; data?: RugbyTenaBallQuestion }> {
  const supabase = createSupabaseServerAdminClient()

  // Validate date format if necessary, though Supabase client should handle it
  // For example: if (!/^\d{4}-\d{2}-\d{2}$/.test(questionData.question_date)) {
  //   return { success: false, error: "Invalid date format. Please use YYYY-MM-DD." };
  // }

  // Check if a question for this date already exists (UNIQUE constraint handles this at DB level too)
  const { data: existingQuestion, error: fetchError } = await supabase
    .from("rugby_tenaball_questions")
    .select("id")
    .eq("question_date", questionData.question_date)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 means no row found
    console.error("Error checking for existing question:", fetchError)
    return { success: false, error: fetchError.message }
  }
  if (existingQuestion) {
    return { success: false, error: `A question for date ${questionData.question_date} already exists.` }
  }

  const { data, error } = await supabase
    .from("rugby_tenaball_questions")
    .insert([
      {
        question_date: questionData.question_date,
        question_text: questionData.question_text,
        answers: questionData.answers,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating question:", error)
    return { success: false, error: error.message }
  }
  revalidatePath("/game/rugby-tenable/admin")
  revalidatePath("/game/rugby-tenable")
  return { success: true, data: { ...data, question_date: data.question_date as string } as RugbyTenaBallQuestion }
}

export async function updateRugbyTenaBallQuestion(
  id: number,
  questionData: Partial<Omit<RugbyTenaBallQuestion, "id" | "created_at">>,
): Promise<{ success: boolean; error?: string; data?: RugbyTenaBallQuestion }> {
  const supabase = createSupabaseServerAdminClient()

  // If question_date is being updated, check for conflicts
  if (questionData.question_date) {
    const { data: conflictingQuestion, error: fetchError } = await supabase
      .from("rugby_tenaball_questions")
      .select("id")
      .eq("question_date", questionData.question_date)
      .not("id", "eq", id) // Exclude the current question being edited
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking for conflicting date:", fetchError)
      return { success: false, error: fetchError.message }
    }
    if (conflictingQuestion) {
      return { success: false, error: `Another question already exists for date ${questionData.question_date}.` }
    }
  }

  const updatePayload: { question_date?: string; question_text?: string; answers?: string[] } = {}
  if (questionData.question_date !== undefined) updatePayload.question_date = questionData.question_date
  if (questionData.question_text !== undefined) updatePayload.question_text = questionData.question_text
  if (questionData.answers !== undefined) updatePayload.answers = questionData.answers

  const { data, error } = await supabase
    .from("rugby_tenaball_questions")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating question:", error)
    return { success: false, error: error.message }
  }
  revalidatePath("/game/rugby-tenable/admin")
  revalidatePath("/game/rugby-tenable")
  return { success: true, data: { ...data, question_date: data.question_date as string } as RugbyTenaBallQuestion }
}

export async function deleteRugbyTenaBallQuestion(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseServerAdminClient()
  const { error } = await supabase.from("rugby_tenaball_questions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting question:", error)
    return { success: false, error: error.message }
  }
  revalidatePath("/game/rugby-tenable/admin")
  revalidatePath("/game/rugby-tenable")
  return { success: true }
}
