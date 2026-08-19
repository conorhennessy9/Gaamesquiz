import Link from "next/link"
import { getStats, getQuestions } from "@/lib/cms/actions"
import { STATUS_COLOURS, SPORT_LABELS, GAME_TYPE_LABELS } from "@/lib/cms/types"
import { PlusCircle, CalendarDays, Upload } from "lucide-react"

export default async function CmsDashboard() {
  const [stats, { data: recent }] = await Promise.all([
    getStats(),
    getQuestions({ limit: 8 }),
  ])

  const statCards = [
    { label: "Total Questions", value: stats.total, colour: "text-white" },
    { label: "Published", value: stats.published, colour: "text-lime-400" },
    { label: "Draft", value: stats.draft, colour: "text-zinc-400" },
    { label: "Scheduled", value: stats.scheduled, colour: "text-blue-400" },
    { label: "Rugby", value: stats.rugby, colour: "text-violet-400" },
    { label: "GAA", value: stats.gaa, colour: "text-emerald-400" },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your daily quiz questions</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/cms/bulk-upload"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-zinc-700"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </Link>
          <Link
            href="/cms/questions/new"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-lime-400 hover:bg-lime-300 text-black font-semibold rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Question
          </Link>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold tracking-tight ${s.colour}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link href="/cms/questions/new" className="group flex items-start gap-4 p-5 bg-zinc-900 border border-zinc-800 hover:border-lime-500/40 rounded-xl transition-all">
          <div className="w-10 h-10 rounded-lg bg-lime-500/10 flex items-center justify-center shrink-0 group-hover:bg-lime-500/20 transition-colors">
            <PlusCircle className="w-5 h-5 text-lime-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Add Question</p>
            <p className="text-xs text-zinc-500 mt-0.5">Create a new Rugby or GAA question</p>
          </div>
        </Link>
        <Link href="/cms/calendar" className="group flex items-start gap-4 p-5 bg-zinc-900 border border-zinc-800 hover:border-blue-500/40 rounded-xl transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
            <CalendarDays className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Content Calendar</p>
            <p className="text-xs text-zinc-500 mt-0.5">View and plan scheduled questions</p>
          </div>
        </Link>
        <Link href="/cms/bulk-upload" className="group flex items-start gap-4 p-5 bg-zinc-900 border border-zinc-800 hover:border-violet-500/40 rounded-xl transition-all">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:bg-violet-500/20 transition-colors">
            <Upload className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Bulk Upload</p>
            <p className="text-xs text-zinc-500 mt-0.5">Import questions from CSV</p>
          </div>
        </Link>
      </div>

      {/* Recent questions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white tracking-tight">Recent Questions</h2>
          <Link href="/cms/questions" className="text-xs text-zinc-500 hover:text-lime-400 transition-colors">
            View all →
          </Link>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Question</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide hidden md:table-cell">Sport</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide hidden md:table-cell">Game</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-zinc-600 text-sm">
                    No questions yet. Add your first question to get started.
                  </td>
                </tr>
              )}
              {recent.map((q) => (
                <tr key={q.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white text-sm truncate max-w-xs">{q.question_text}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{q.answers.length} answers</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.sport === "rugby" ? "bg-violet-500/15 text-violet-300" : "bg-emerald-500/15 text-emerald-300"}`}>
                      {SPORT_LABELS[q.sport]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-zinc-400">{GAME_TYPE_LABELS[q.game_type]}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-zinc-500">{q.question_date ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOURS[q.status]}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/cms/questions/${q.id}`} className="text-xs text-zinc-500 hover:text-lime-400 transition-colors">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
