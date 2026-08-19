import { notFound } from "next/navigation"
import { getFormOptions, getQuestionForEdit } from "@/lib/cms/question-form-actions"
import QuestionForm from "../../question-form"

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

  const [record, formOptions] = await Promise.all([getQuestionForEdit(questionId), getFormOptions()])

  if (!record) notFound()

  return (
    <QuestionForm
      mode="edit"
      questionId={questionId}
      initialValues={record.formValues}
      formOptions={formOptions}
    />
  )
}
