"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      <LogOut className="w-3.5 h-3.5" />
      {loading ? "Signing out..." : "Sign out"}
    </button>
  )
}
