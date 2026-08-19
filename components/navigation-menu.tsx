"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Home, Mail, Info, FileText, Shield, ChevronRight } from "lucide-react"

interface NavigationMenuProps {
  currentSection?: "rugby" | "gaa" | "home"
}

export function NavigationMenu({ currentSection = "home" }: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
        <span className="text-xs font-semibold tracking-widest uppercase">Menu</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#0f0f0f] border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
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

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 px-3 pb-2">Home</p>
          <NavLink href="/" icon={<Home className="w-4 h-4" />} label="Home" onClick={() => setIsOpen(false)} />

          <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 px-3 pb-2 pt-6">Sports</p>
          <NavLink
            href="/rugby"
            icon={<span className="w-4 h-4 flex items-center justify-center rounded text-[10px] font-black bg-violet-500 text-white">R</span>}
            label="Rugby"
            active={currentSection === "rugby"}
            activeColor="bg-violet-500/10 text-violet-300"
            onClick={() => setIsOpen(false)}
          />
          <NavLink
            href="/gaa"
            icon={<span className="w-4 h-4 flex items-center justify-center rounded text-[10px] font-black bg-emerald-500 text-white">G</span>}
            label="GAA"
            active={currentSection === "gaa"}
            activeColor="bg-emerald-500/10 text-emerald-300"
            onClick={() => setIsOpen(false)}
          />

          <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 px-3 pb-2 pt-6">Info</p>
          <NavLink href="/about" icon={<Info className="w-4 h-4" />} label="About" onClick={() => setIsOpen(false)} />
          <NavLink href="/contact" icon={<Mail className="w-4 h-4" />} label="Contact" onClick={() => setIsOpen(false)} />
          <NavLink href="/terms" icon={<FileText className="w-4 h-4" />} label="Terms of Service" onClick={() => setIsOpen(false)} />
          <NavLink href="/privacy" icon={<Shield className="w-4 h-4" />} label="Privacy Policy" onClick={() => setIsOpen(false)} />
        </nav>

        {/* Footer tag */}
        <div className="px-6 py-5 border-t border-white/[0.06]">
          <p className="text-[11px] text-white/25">Daily rugby &amp; GAA quiz games</p>
        </div>
      </div>
    </>
  )
}

function NavLink({
  href,
  icon,
  label,
  active = false,
  activeColor = "bg-[#e8ff47]/10 text-[#e8ff47]",
  onClick,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
  activeColor?: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active ? activeColor : "text-white/60 hover:text-white hover:bg-white/[0.05]"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
    </Link>
  )
}
