// This file provides mock authentication functions to replace next-auth
// without requiring SessionProvider

export function useSession() {
  return {
    data: null,
    status: "unauthenticated",
  }
}

export function signIn() {
  console.log("Mock sign in called")
  return Promise.resolve({ ok: true, error: null })
}

export function signOut() {
  console.log("Mock sign out called")
  return Promise.resolve({ ok: true, error: null })
}
