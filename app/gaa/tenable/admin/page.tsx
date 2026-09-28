import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import GAATenaBallAdminClient from "./admin-client"

export default async function GAATenaBallAdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login?next=/gaa/tenable/admin")
  }

  return <GAATenaBallAdminClient />
}
