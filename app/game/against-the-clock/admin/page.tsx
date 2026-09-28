import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import RugbyClockAdminClient from "./admin-client"

export default async function RugbyClockAdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login?next=/game/against-the-clock/admin")
  }

  return <RugbyClockAdminClient />
}
