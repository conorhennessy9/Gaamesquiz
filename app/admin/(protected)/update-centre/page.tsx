import { getReviewQuestions } from "@/lib/cms/update-centre-actions"
import { evaluateReview, isCompetitionReview } from "@/lib/cms/update-centre-review"
import UpdateCentre from "./update-centre"

export const metadata = {
  title: "Update Centre | GAAmesquiz Admin",
}

export const dynamic = "force-dynamic"

function todayInDublin(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin" }).format(new Date())
}

export default async function UpdateCentrePage() {
  const today = todayInDublin()
  const { data, error } = await getReviewQuestions()
  const items = data.map((q) => evaluateReview(q, today))

  const sections = {
    due: items.filter((q) => q.isDue),
    competition: items.filter(isCompetitionReview),
    snapshot: items.filter((q) => q.evergreen_type === "snapshot"),
    semi: items.filter((q) => q.evergreen_type === "semi_evergreen"),
    live: items.filter((q) => q.evergreen_type === "live"),
  }

  return (
    <div className="max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold tracking-tight">Update Centre</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Questions whose answers may need checking. Marking a question verified only updates its last verified date
          — answers are never changed here.
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Could not load questions: {error}
        </p>
      ) : (
        <UpdateCentre sections={sections} today={today} />
      )}
    </div>
  )
}
