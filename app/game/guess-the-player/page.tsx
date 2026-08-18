"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, Settings } from "lucide-react"
import Link from "next/link"
import { NavigationMenu } from "@/components/navigation-menu"

export default function GuessThePlayerPage() {
  const [navigationOpen, setNavigationOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="p-4 border-b border-purple-700/50">
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

            <h1 className="text-2xl font-bold text-white tracking-wider">GUESS THE PLAYER</h1>

            <div className="flex items-center gap-2">
              <Link href="/game/guess-the-player/admin">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Settings className="w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-2">
            <span className="text-lime-400 text-sm">Play Rugby Games at </span>
            <span className="text-lime-400 text-sm font-bold">www.playrugby.games</span>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <NavigationMenu isOpen={navigationOpen} onClose={() => setNavigationOpen(false)} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-black/50 border-purple-700/50 max-w-3xl mx-auto">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-5xl">🚧</span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">Work in Progress</h2>
            <p className="text-xl text-slate-300 mb-8">Guess the Player is coming soon!</p>

            <div className="bg-slate-800/70 p-6 rounded-lg text-left max-w-lg mx-auto mb-8">
              <h3 className="text-lime-400 font-bold mb-3">Coming Features:</h3>
              <ul className="text-white space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400">•</span>
                  <span>Filter players by position, league, country, and age</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400">•</span>
                  <span>Progressive clues that reveal more details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400">•</span>
                  <span>Career statistics and achievements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400">•</span>
                  <span>Difficulty levels from legends to current players</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/rugby">
                <Button className="bg-lime-400 hover:bg-lime-500 text-black font-bold px-8 py-2">
                  Back to Rugby Games
                </Button>
              </Link>

              <Link href="/game/guess-the-player/admin">
                <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-900/20">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Access
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
