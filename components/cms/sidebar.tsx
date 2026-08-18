"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PlusCircle,
  List,
  CalendarDays,
  Upload,
  BarChart2,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const NAV = [
  { href: "/cms", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/cms/questions/new", label: "Add Question", icon: PlusCircle },
  { href: "/cms/questions", label: "All Questions", icon: List },
  { href: "/cms/calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/cms/bulk-upload", label: "Bulk Upload", icon: Upload },
  { href: "/cms/stats", label: "Stats", icon: BarChart2 },
]

export default function CmsSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0d0d0d] border-r border-zinc-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-zinc-800">
        <Link href="/" className="block">
          <span className="text-xs tracking-[0.2em] text-zinc-500 uppercase">GAAmesquiz</span>
          <p className="text-white font-bold text-sm mt-0.5">Content Studio</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href) && href !== "/cms/questions/new"
            ? pathname.startsWith(href)
            : pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                active
                  ? "bg-lime-500/10 text-lime-400 border border-lime-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </span>
              <ChevronRight className={`w-3 h-3 transition-opacity ${active ? "opacity-100 text-lime-400" : "opacity-0 group-hover:opacity-50"}`} />
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 truncate mb-3">{userEmail}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
