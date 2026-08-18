"use client"

// This is a mock implementation of useSession to prevent deployment errors
export function useSession() {
  return {
    data: null,
    status: "unauthenticated",
    update: async () => null,
  }
}
