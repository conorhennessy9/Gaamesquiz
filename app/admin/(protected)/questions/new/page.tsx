import { getFormOptions } from "@/lib/cms/question-form-actions"
import { EMPTY_QUESTION_FORM } from "@/lib/cms/question-form-types"
import QuestionForm from "../question-form"

export const metadata = {
  title: "Add Question | GAAmesquiz Admin",
}

export default async function NewQuestionPage() {
  const formOptions = await getFormOptions()

  return <QuestionForm mode="create" initialValues={EMPTY_QUESTION_FORM} formOptions={formOptions} />
}
