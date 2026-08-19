import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CmsSidebar from "@/components/cms/sidebar"

export const metadata = {
  title: "GAAmesquiz CMS",
  description: "Admin content management system",
}

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login?next=/cms")

  return (
    <div className="flex min-h-screen bg-[#080808]">
      <CmsSidebar userEmail={user.email ?? ""} />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">{children}</main>
    </div>
  )
}
