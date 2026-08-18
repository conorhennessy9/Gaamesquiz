"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, Settings } from "lucide-react"
import Link from "next/link"
import { NavigationMenu } from "@/components/navigation-menu"

export default function FindTheClubPage() {
  const [navigationOpen, setNavigationOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      {/* Header */}
      <header className="p-4 border-b border-green-700/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setNavigationOpen(!navigationOpen)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-wider">FIND THE CLUB</h1>

            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Settings className="w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-2">
            <span className="text-amber-400 text-sm">Play GAA Games at </span>
            <span className="text-amber-400 text-sm font-bold">www.playrugby.games</span>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <NavigationMenu isOpen={navigationOpen} onClose={() => setNavigationOpen(false)} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-black/50 border-green-700/50 max-w-3xl mx-auto">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-5xl">🚧</span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">Work in Progress</h2>
            <p className="text-xl text-slate-300 mb-8">Find the Club is coming soon!</p>

            <div className="bg-slate-800/70 p-6 rounded-lg text-left max-w-lg mx-auto mb-8">
              <h3 className="text-amber-400 font-bold mb-3">Coming Features:</h3>
              <ul className="text-white space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>Identify GAA clubs from partial crests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>County-based challenges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>Club history and achievement facts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>Both hurling and football clubs</span>
                </li>
              </ul>
            </div>

            <Link href="/gaa">
              <Button className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-2">
                Back to GAA Games
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
