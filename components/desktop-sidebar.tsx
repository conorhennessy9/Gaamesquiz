"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_SECTIONS, isNavItemActive } from "@/components/nav-config"

/**
 * Persistent left-hand sidebar shown on desktop (lg breakpoint and up).
 * Hidden on smaller screens — mobile continues to use the hamburger
 * drawer from `components/navigation-menu.tsx`.
 */
export function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-white/[0.06] bg-[#0d0d0d]">
      {/* Brand */}
      <div className="flex items-center px-6 py-5 border-b border-white/[0.06]">
        <Link href="/" className="text-lg font-black tracking-tight text-white">
          GAA<span className="text-[#e8ff47]">mes</span>quiz
        </Link>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 px-3 pb-2">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isNavItemActive(item, pathname)

                if (item.soon) {
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-white/25 cursor-not-allowed"
                      title="Coming soon"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </span>
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white/30">
                        Soon
                      </span>
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#e8ff47]/10 text-[#e8ff47]"
                        : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer tag */}
      <div className="px-6 py-5 border-t border-white/[0.06]">
        <p className="text-[11px] text-white/25">Daily rugby &amp; GAA quiz games</p>
      </div>
    </aside>
  )
}
