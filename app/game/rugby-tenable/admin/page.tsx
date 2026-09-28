import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import RugbyTenaBallAdminClient from "./admin-client"

export default async function RugbyTenaBallAdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login?next=/game/rugby-tenable/admin")
  }

  return <RugbyTenaBallAdminClient />
}
