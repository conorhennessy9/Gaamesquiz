"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { ReviewQuestion } from "./update-centre-review"

const REVIEW_COLUMNS = [
  "id",
  "question_text",
  "answers",
  "sport",
  "game_type",
  "status",
  "competition",
  "evergreen_type",
  "review_frequency",
  "update_trigger",
  "snapshot_period",
  "last_verified_at",
  "question_date",
].join(",")

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export async function getReviewQuestions(): Promise<{ data: ReviewQuestion[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quiz_questions")
    .select(REVIEW_COLUMNS)
    .neq("status", "archived")
    .order("last_verified_at", { ascending: true, nullsFirst: true })
    .order("id", { ascending: true })
    .limit(5000)

  if (error) return { data: [], error: error.message }
  return { data: (data as unknown as ReviewQuestion[]) ?? [] }
}

// Only updates last_verified_at. Answers, status, and all other fields are
// deliberately left untouched.
export async function markQuestionVerified(
  id: number,
  verifiedOn: string,
): Promise<{ success: boolean; error?: string; last_verified_at?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in." }

  if (!Number.isInteger(id) || id <= 0) return { success: false, error: "Invalid question." }
  if (!DATE_PATTERN.test(verifiedOn) || Number.isNaN(Date.parse(`${verifiedOn}T00:00:00Z`))) {
    return { success: false, error: "Verified date must be a valid date." }
  }

  // Allow one day of leeway for admins ahead of UTC.
  const tomorrowUtc = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
  if (verifiedOn > tomorrowUtc) return { success: false, error: "Verified date cannot be in the future." }

  const { data, error } = await supabase
    .from("quiz_questions")
    .update({ last_verified_at: verifiedOn })
    .eq("id", id)
    .select("last_verified_at")
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath("/admin/update-centre")
  revalidatePath("/admin/questions")
  return { success: true, last_verified_at: data.last_verified_at }
}
