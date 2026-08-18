"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { DesktopSidebar } from "@/components/desktop-sidebar"

/**
 * Mounts the persistent desktop sidebar around every page except the CMS,
 * which already has its own dedicated authenticated sidebar/layout.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCms = pathname?.startsWith("/cms")

  if (isCms) {
    return <>{children}</>
  }

  return (
    <>
      <DesktopSidebar />
      <div className="lg:pl-64">{children}</div>
    </>
  )
}
