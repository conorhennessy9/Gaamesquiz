import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import GAAClockAdminClient from "./admin-client"

export default async function GAAClockAdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login?next=/gaa/against-the-clock/admin")
  }

  return <GAAClockAdminClient />
}
