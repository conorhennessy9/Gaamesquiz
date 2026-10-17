"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Eye, Pencil } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { STATUS_COLOURS } from "@/lib/cms/types"
import { markQuestionVerified } from "@/lib/cms/update-centre-actions"
import type { ReviewItem } from "@/lib/cms/update-centre-review"

type SectionKey = "due" | "competition" | "snapshot" | "semi" | "live"

const SECTION_LABELS: Record<SectionKey, string> = {
  due: "Due for review",
  competition: "Competition reviews",
  snapshot: "Snapshot",
  semi: "Semi-evergreen",
  live: "Live",
}

const SECTION_EMPTY: Record<SectionKey, string> = {
  due: "Nothing is due for review.",
  competition: "No questions are set to review at the end of a competition.",
  snapshot: "No snapshot questions.",
  semi: "No semi-evergreen questions.",
  live: "No live questions.",
}

const LABELS: Record<string, string> = {
  rugby: "Rugby",
  gaa: "GAA",
  tenable: "Tenable",
  against_the_clock: "Timer",
  true_evergreen: "True evergreen",
  semi_evergreen: "Semi-evergreen",
  snapshot: "Snapshot",
  live: "Live",
  never: "Never",
  annual: "Annual",
  competition_end: "Competition end",
  monthly: "Monthly",
  manual: "Manual",
}

const FALLBACK_STATUS_STYLE = "bg-zinc-800 text-zinc-300"

function label(value: string | null | undefined): string {
  if (!value) return "—"
  return LABELS[value] ?? value.replace(/_/g, " ")
}

interface Props {
  sections: Record<SectionKey, ReviewItem[]>
  today: string
}

export default function UpdateCentre({ sections, today }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<ReviewItem | null>(null)
  const [verifiedOn, setVerifiedOn] = useState(today)
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  function openQuestion(q: ReviewItem) {
    setSelected(q)
    setVerifiedOn(today)
  }

  function verify(q: ReviewItem, date: string) {
    setPendingId(q.id)
    startTransition(async () => {
      const result = await markQuestionVerified(q.id, date)
      setPendingId(null)
      if (result.success) {
        setMessage({ tone: "ok", text: `Question #${q.id} marked verified on ${result.last_verified_at}.` })
        setSelected(null)
        router.refresh()
      } else {
        setMessage({ tone: "error", text: result.error ?? "Could not mark verified." })
      }
    })
  }

  const keys = Object.keys(SECTION_LABELS) as SectionKey[]

  return (
    <>
      {message && (
        <p
          role="status"
          className={`mb-4 rounded-md border px-4 py-2 text-sm ${
            message.tone === "ok"
              ? "border-lime-900 bg-lime-950/40 text-lime-300"
              : "border-red-900 bg-red-950/40 text-red-300"
          }`}
        >
          {message.text}
        </p>
      )}

      <Tabs defaultValue="due">
        <TabsList className="bg-zinc-900 border border-zinc-800 flex-wrap h-auto">
          {keys.map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
            >
              {SECTION_LABELS[key]}
              <span className="ml-2 rounded bg-zinc-800 px-1.5 text-xs text-zinc-300">{sections[key].length}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {keys.map((key) => (
          <TabsContent key={key} value={key} className="mt-4">
            {sections[key].length === 0 ? (
              <p className="rounded-lg border border-zinc-800 px-4 py-10 text-center text-sm text-zinc-500">
                {SECTION_EMPTY[key]}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-900 text-left text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Question</th>
                      <th scope="col" className="px-4 py-3 font-medium">Sport / Game</th>
                      <th scope="col" className="px-4 py-3 font-medium">Status</th>
                      <th scope="col" className="px-4 py-3 font-medium">Competition</th>
                      <th scope="col" className="px-4 py-3 font-medium">Type / Review</th>
                      <th scope="col" className="px-4 py-3 font-medium">Last verified</th>
                      <th scope="col" className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections[key].map((q) => (
                      <tr key={q.id} className="border-t border-zinc-800 align-top text-zinc-300">
                        <td className="px-4 py-3 max-w-md">
                          <p className="text-white text-pretty">{q.question_text}</p>
                          {q.dueReason && <p className="mt-1 text-xs text-amber-400">{q.dueReason}</p>}
                          {q.update_trigger && (
                            <p className="mt-1 text-xs text-zinc-500">Trigger: {q.update_trigger}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {label(q.sport)} · {label(q.game_type)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${(STATUS_COLOURS as Record<string, string>)[q.status] ?? FALLBACK_STATUS_STYLE} border-0`}>
                            {label(q.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{q.competition || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p>{label(q.evergreen_type)}</p>
                          <p className="text-xs text-zinc-500">
                            Review: {label(q.review_frequency)}
                            {q.snapshot_period ? ` · ${q.snapshot_period}` : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {q.last_verified_at ?? <span className="text-zinc-500">Never</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
                              onClick={() => openQuestion(q)}
                            >
                              <Eye className="h-4 w-4" />
                              Verify
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                              <Link href={`/admin/questions/${q.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              className="bg-lime-500 text-black hover:bg-lime-400"
                              disabled={isPending && pendingId === q.id}
                              onClick={() => verify(q, today)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {isPending && pendingId === q.id ? "Saving…" : "Mark verified"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-pretty">{selected.question_text}</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Check the answers below are still correct. To change them, use Edit.
                </DialogDescription>
              </DialogHeader>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-zinc-500">Sport / Game</dt>
                  <dd>
                    {label(selected.sport)} · {label(selected.game_type)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Competition</dt>
                  <dd>{selected.competition || "—"}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Type / Review</dt>
                  <dd>
                    {label(selected.evergreen_type)} · {label(selected.review_frequency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Snapshot period</dt>
                  <dd>{selected.snapshot_period || "—"}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Update trigger</dt>
                  <dd>{selected.update_trigger || "—"}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Last verified</dt>
                  <dd>{selected.last_verified_at ?? "Never"}</dd>
                </div>
              </dl>

              <div>
                <h3 className="mb-2 text-sm text-zinc-500">Answers</h3>
                {selected.answers && selected.answers.length > 0 ? (
                  <ol className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
                    {selected.answers.map((answer, i) => (
                      <li key={i} className="flex gap-2 rounded bg-zinc-800/60 px-3 py-1.5">
                        <span className="w-5 text-zinc-500">{i + 1}.</span>
                        <span>{answer}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-zinc-500">No answers.</p>
                )}
              </div>

              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="verified-on" className="text-zinc-400">
                    Verified on
                  </Label>
                  <Input
                    id="verified-on"
                    type="date"
                    value={verifiedOn}
                    max={today}
                    onChange={(e) => setVerifiedOn(e.target.value)}
                    className="w-44 bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button asChild variant="outline" className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800">
                  <Link href={`/admin/questions/${selected.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Edit question
                  </Link>
                </Button>
                <Button
                  className="bg-lime-500 text-black hover:bg-lime-400"
                  disabled={!verifiedOn || isPending}
                  onClick={() => verify(selected, verifiedOn)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isPending ? "Saving…" : "Mark verified"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
