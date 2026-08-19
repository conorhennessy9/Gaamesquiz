import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { STATUS_COLOURS, type QuizQuestion } from "@/lib/cms/types"

export const metadata = {
  title: "Edit Question | GAAmesquiz Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionPage({ params }: PageProps) {
  const { id } = await params
  const questionId = Number(id)
  if (!Number.isFinite(questionId)) notFound()

  const supabase = await createClient()
  const { data: question } = await supabase.from("quiz_questions").select("*").eq("id", questionId).single()

  if (!question) notFound()

  const q = question as QuizQuestion

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/questions"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Question Library
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-white text-xl font-bold tracking-tight">Question #{q.id}</h1>
        <Badge className={`${STATUS_COLOURS[q.status] ?? "bg-zinc-700 text-zinc-300"} border-0`}>{q.status}</Badge>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-4">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Question</p>
          <p className="text-white text-sm leading-relaxed">{q.question_text}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Answers</p>
          <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
            {q.answers.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Sport</p>
            <p className="text-sm text-zinc-300 capitalize">{q.sport}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Difficulty</p>
            <p className="text-sm text-zinc-300 capitalize">{q.difficulty ?? "—"}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-600 mt-6">
        This is a read-only preview. The full question editor was not part of this task and has not been built yet.
      </p>
    </div>
  )
}
