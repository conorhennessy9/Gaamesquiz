"use server"

import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface GAATenaBallQuestion {
  id: number
  question_text: string
  answers: string[]
  question_date: string // YYYY-MM-DD format
  created_at?: string
  updated_at?: string
}

export async function getGAATenaBallQuestions(): Promise<GAATenaBallQuestion[]> {
  try {
    const supabase = createSupabaseServerAdminClient()
    const { data, error } = await supabase
      .from("gaa_tenaball_questions")
      .select("*")
      .order("question_date", { ascending: false })

    if (error) {
      console.error("Error fetching GAA TenaBall questions:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Failed to fetch GAA TenaBall questions:", error)
    return []
  }
}

export async function getGAATenaBallQuestionByDate(date: string): Promise<GAATenaBallQuestion | null> {
  try {
    const supabase = createSupabaseServerAdminClient()
    const { data, error } = await supabase
      .from("gaa_tenaball_questions")
      .select("*")
      .eq("question_date", date)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching GAA TenaBall question for date ${date}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error(`Failed to fetch GAA TenaBall question for date ${date}:`, error)
    return null
  }
}

export async function createGAATenaBallQuestion(
  questionText: string,
  answers: string[],
  questionDate: string,
): Promise<{ success: boolean; message: string; question?: GAATenaBallQuestion }> {
  try {
    const supabase = createSupabaseServerAdminClient()

    // Check if a question already exists for this date
    const { data: existingQuestion } = await supabase
      .from("gaa_tenaball_questions")
      .select("id")
      .eq("question_date", questionDate)
      .maybeSingle()

    if (existingQuestion) {
      return {
        success: false,
        message: `A question already exists for ${questionDate}. Please edit the existing question or choose a different date.`,
      }
    }

    // Insert the new question
    const { data, error } = await supabase
      .from("gaa_tenaball_questions")
      .insert({
        question_text: questionText,
        answers: answers,
        question_date: questionDate,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating GAA TenaBall question:", error)
      return {
        success: false,
        message: `Failed to create question: ${error.message}`,
      }
    }

    revalidatePath("/gaa/tenable")
    revalidatePath("/gaa/tenable/admin")

    return {
      success: true,
      message: "Question created successfully!",
      question: data,
    }
  } catch (error) {
    console.error("Failed to create GAA TenaBall question:", error)
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function updateGAATenaBallQuestion(
  id: number,
  questionText: string,
  answers: string[],
  questionDate: string,
): Promise<{ success: boolean; message: string; question?: GAATenaBallQuestion }> {
  try {
    const supabase = createSupabaseServerAdminClient()

    // Check if updating the date would conflict with another question
    const { data: existingQuestion } = await supabase
      .from("gaa_tenaball_questions")
      .select("id")
      .eq("question_date", questionDate)
      .neq("id", id)
      .maybeSingle()

    if (existingQuestion) {
      return {
        success: false,
        message: `Another question already exists for ${questionDate}. Please choose a different date.`,
      }
    }

    // Update the question
    const { data, error } = await supabase
      .from("gaa_tenaball_questions")
      .update({
        question_text: questionText,
        answers: answers,
        question_date: questionDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating GAA TenaBall question ${id}:`, error)
      return {
        success: false,
        message: `Failed to update question: ${error.message}`,
      }
    }

    revalidatePath("/gaa/tenable")
    revalidatePath("/gaa/tenable/admin")

    return {
      success: true,
      message: "Question updated successfully!",
      question: data,
    }
  } catch (error) {
    console.error(`Failed to update GAA TenaBall question ${id}:`, error)
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function deleteGAATenaBallQuestion(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createSupabaseServerAdminClient()
    const { error } = await supabase.from("gaa_tenaball_questions").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting GAA TenaBall question ${id}:`, error)
      return {
        success: false,
        message: `Failed to delete question: ${error.message}`,
      }
    }

    revalidatePath("/gaa/tenable")
    revalidatePath("/gaa/tenable/admin")

    return {
      success: true,
      message: "Question deleted successfully!",
    }
  } catch (error) {
    console.error(`Failed to delete GAA TenaBall question ${id}:`, error)
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
