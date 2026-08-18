"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { NAV_SECTIONS, isNavItemActive } from "@/components/nav-config"

interface NavigationMenuProps {
  /** @deprecated kept for backward compatibility, active state is now derived from the pathname */
  currentSection?: "rugby" | "gaa" | "home"
}

export function NavigationMenu(_props: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Portal the drawer to document.body so it isn't clipped by any ancestor
  // header using `backdrop-blur`, which creates its own containing block
  // for fixed-position descendants.
  useEffect(() => setMounted(true), [])

  const drawer = (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#0f0f0f] border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <span className="text-lg font-black tracking-tight text-white">
              GAA<span className="text-[#e8ff47]">mes</span>quiz
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
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
                      onClick={() => setIsOpen(false)}
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
      </div>
    </>
  )

  return (
    <>
      {/* Trigger — only shown below the desktop breakpoint, since the
          persistent sidebar (components/desktop-sidebar.tsx) covers lg+ */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
        <span className="text-xs font-semibold tracking-widest uppercase">Menu</span>
      </button>

      {mounted ? createPortal(drawer, document.body) : null}
    </>
  )
}
