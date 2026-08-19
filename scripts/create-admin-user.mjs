import { createClient } from "@supabase/supabase-js"
import crypto from "node:crypto"

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.argv[2]

if (!url || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}
if (!email) {
  console.error("Usage: node create-admin-user.mjs <email>")
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Generate a strong temporary password
const tempPassword = crypto.randomBytes(12).toString("base64url") + "!A1"

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password: tempPassword,
  email_confirm: true,
})

if (error) {
  console.error("ERROR:", error.message)
  process.exit(1)
}

console.log("ADMIN_USER_CREATED")
console.log("email:", data.user.email)
console.log("temp_password:", tempPassword)
console.log("user_id:", data.user.id)
