import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use anon key for regular client
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    },
  )
}

// Alias export for common usage pattern
export function createClient() {
  return createSupabaseServerClient()
}

export function createSupabaseServerAdminClient() {
  // For admin actions using the service_role key, we might not need
  // the full cookie management if we're not dealing with user sessions.
  // However, createServerClient from @supabase/ssr expects a cookie interface.
  // We can provide a minimal one.
  // The key is that Server Actions *do* have access to the cookie store
  // via `cookies()` from `next/headers`, so we should leverage that
  // consistently if the client is used within that context.

  // Let's align it with how createSupabaseServerClient is defined,
  // as Server Actions will provide the cookie context.
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        // Ensure cookieStore.set is called correctly
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Log error if cookie setting fails, useful for debugging
          // console.error("Failed to set cookie:", name, error);
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options }) // supabase-js way to remove
        } catch (error) {
          // console.error("Failed to remove cookie:", name, error);
        }
      },
    },
  })
}
