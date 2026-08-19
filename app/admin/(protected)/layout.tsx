import type React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminLogoutButton from "@/components/admin/logout-button"

export const metadata = {
  title: "Admin | GAAmesquiz",
  description: "Administrator area",
}

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login?next=/admin")

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-6">
          <span className="text-white font-bold text-sm tracking-tight">GAAMES Admin</span>
          <nav className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-xs text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/questions" className="text-xs text-zinc-400 hover:text-white transition-colors">
              Questions
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500 truncate max-w-[200px]">{user.email}</span>
          <AdminLogoutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
