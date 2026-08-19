"use client"

import Link from "next/link"
import { NavigationMenu } from "@/components/navigation-menu"
import { ArrowRight, Info } from "lucide-react"

const games = [
  {
    id: "rugby-tenable",
    href: "/game/rugby-tenable",
    name: "TenaBall",
    tagline: "Find every answer",
    desc: "A question is set — you have to name all the correct answers before you rack up 3 strikes. How well do you really know rugby?",
    stat: "10 answers",
  },
  {
    id: "against-the-clock",
    href: "/game/against-the-clock",
    name: "Against the Clock",
    tagline: "Beat the timer",
    desc: "A new list every day. Name as many correct answers as you can before the clock hits zero. Every right answer earns bonus time.",
    stat: "60 seconds",
  },
]

export default function RugbyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <NavigationMenu currentSection="rugby" />
          <Link href="/" className="text-lg font-black tracking-tight text-white">
            GAA<span className="text-[#e8ff47]">mes</span>quiz
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero text */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-500" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/40">Rugby</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4 text-balance leading-none">
            Rugby Quiz Games
          </h1>
          <p className="text-base text-white/40 max-w-lg leading-relaxed">
            Daily challenges for rugby fans. New questions every day — test yourself on players, clubs, tournaments and history.
          </p>
        </div>

        {/* Game cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {games.map((game) => (
            <Link key={game.id} href={game.href}>
              <div className="group relative rounded-xl border border-white/[0.08] bg-[#111] p-6 hover:border-violet-500/30 hover:bg-[#161616] transition-all duration-200 h-full flex flex-col cursor-pointer">
                <div className="flex items-center justify-between mb-5">
                  <span className="rounded-md bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-300 border border-violet-500/20">
                    {game.stat}
                  </span>
                </div>

                <h2 className="text-xl font-black text-white mb-1">{game.name}</h2>
                <p className="text-xs font-semibold tracking-wide text-violet-400 mb-3 uppercase">{game.tagline}</p>
                <p className="text-sm text-white/40 leading-relaxed flex-1">{game.desc}</p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#e8ff47] group-hover:gap-3 transition-all">
                  Play now <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* How to play links */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-wrap gap-3">
          <Link
            href="/how-to-play/tenable"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/50 hover:text-white hover:border-white/20 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            How to play TenaBall
          </Link>
          <Link
            href="/how-to-play/against-the-clock"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/50 hover:text-white hover:border-white/20 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            How to play Against the Clock
          </Link>
        </div>
      </main>
    </div>
  )
}
