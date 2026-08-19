import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

// This bare /admin/questions/[id] route exists only to redirect to the real
// editor at /admin/questions/[id]/edit, so any older links keep working.
export default async function QuestionRedirectPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/admin/questions/${id}/edit`)
}
