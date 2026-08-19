import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.")
  process.exit(1)
}

const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
  console.error("Usage: node set-admin-password.mjs <email> <newPassword>")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // Find the user by email (list + filter, since admin API has no direct getByEmail)
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
    perPage: 200,
  })

  if (listError) {
    console.error("Failed to list users:", listError.message)
    process.exit(1)
  }

  const user = listData.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  )

  if (!user) {
    console.error(`No user found with email ${email}`)
    process.exit(1)
  }

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
  })

  if (error) {
    console.error("Failed to update password:", error.message)
    process.exit(1)
  }

  console.log("Password updated successfully for:", data.user.email)
}

main()
