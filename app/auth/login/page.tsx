"use client"

import { useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/cms")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#e8ff47] rounded-sm" />
            <span className="text-white font-bold text-xl tracking-tight">GAAMES</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Admin CMS</h1>
          <p className="text-[#6b7280] text-sm">Sign in to manage quiz content</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@gaames.ie"
              className="w-full px-3 py-2.5 bg-[#111] border border-[#242424] rounded-md text-white placeholder-[#4b5563] focus:outline-none focus:border-[#e8ff47] focus:ring-1 focus:ring-[#e8ff47] text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2.5 bg-[#111] border border-[#242424] rounded-md text-white placeholder-[#4b5563] focus:outline-none focus:border-[#e8ff47] focus:ring-1 focus:ring-[#e8ff47] text-sm transition-colors"
            />
          </div>

          {error && (
            <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-semibold rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-[#4b5563] text-xs mt-6">
          Restricted to authorised administrators only.
        </p>
      </div>
    </div>
  )
}
