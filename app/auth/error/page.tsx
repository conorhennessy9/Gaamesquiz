import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-white text-2xl font-bold mb-2">Authentication Error</h1>
        <p className="text-[#6b7280] text-sm mb-6">Something went wrong during sign in. Please try again.</p>
        <Link
          href="/auth/login"
          className="px-4 py-2 bg-[#e8ff47] text-black font-semibold rounded-md text-sm hover:bg-[#d4eb3a] transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}
