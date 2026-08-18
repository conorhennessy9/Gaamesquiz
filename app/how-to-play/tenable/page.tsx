import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Target, AlertTriangle, Trophy, Clock } from "lucide-react"

export default function TenableHowToPlayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="p-4 border-b border-slate-700">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-white text-xl font-bold">How to Play TenaBall</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Target className="w-8 h-8 text-lime-400" />
                TenaBall Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p className="text-lg">
                TenaBall is our signature ladder-style quiz game that challenges your sports knowledge in a unique and
                exciting format. Each day brings a fresh question with exactly 10 correct answers waiting to be
                discovered.
              </p>
              <p>
                The name "TenaBall" comes from the classic TV show "Tenable" combined with the sporting focus of our
                platform. It's designed to test not just what you know, but how comprehensively you can think about a
                topic.
              </p>
            </CardContent>
          </Card>

          {/* Game Mechanics */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Game Mechanics</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">The Ladder System</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 10 positions from bottom (10) to top (1)</li>
                    <li>• Each correct answer fills one position</li>
                    <li>• Answers can be found in any order</li>
                    <li>• Visual progress tracking as you climb</li>
                    <li>• Trophy unlocked when all 10 are found</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Strike System</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• You have exactly 3 strikes per game</li>
                    <li>• Wrong answers count as strikes</li>
                    <li>• Duplicate answers don't count as strikes</li>
                    <li>• Game ends when you reach 3 strikes</li>
                    <li>• Strategic thinking is essential</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Play Steps */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Step-by-Step Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-lime-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Read the Question</h4>
                    <p className="text-sm">
                      Each question asks for 10 specific answers. Read carefully to understand what's being asked.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-lime-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Type Your Answer</h4>
                    <p className="text-sm">
                      Enter your answer in the input field. Our smart system recognizes various spellings and formats.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-lime-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Watch the Ladder</h4>
                    <p className="text-sm">
                      Correct answers appear on the ladder. Wrong answers give you a strike. Plan your guesses wisely!
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-lime-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Complete the Challenge</h4>
                    <p className="text-sm">
                      Find all 10 answers to achieve a perfect score, or see how many you can get before 3 strikes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips and Strategies */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                Tips and Strategies
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Smart Guessing</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Start with the most obvious answers</li>
                    <li>• Think chronologically for historical questions</li>
                    <li>• Consider different categories within the topic</li>
                    <li>• Save risky guesses for when you have strikes to spare</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Answer Formats</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Try different spellings if unsure</li>
                    <li>• Use common abbreviations (e.g., "USA" or "United States")</li>
                    <li>• Don't worry about exact punctuation</li>
                    <li>• Team names work with or without "FC", "RFC", etc.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring and Stats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Scoring and Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Daily Scoring</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 1 point per correct answer</li>
                    <li>• Maximum 10 points per day</li>
                    <li>• Strikes don't reduce your score</li>
                    <li>• Perfect games (10/10, 0 strikes) are special</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Streak Building</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Perfect games build your streak</li>
                    <li>• Streaks reset if you don't get 10/10</li>
                    <li>• Track your longest streak ever</li>
                    <li>• Share your achievements</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Statistics</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Games played and average score</li>
                    <li>• Total perfect games achieved</li>
                    <li>• Current and longest streaks</li>
                    <li>• Daily and overall progress tracking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Challenge */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Clock className="w-6 h-6 text-blue-400" />
                Daily Challenge Format
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                TenaBall operates on a daily challenge system. Each day at midnight GMT, a new question becomes
                available. This ensures that everyone worldwide gets the same question on the same day, creating a
                shared experience and fair competition.
              </p>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Key Points:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• One question per day, available for 24 hours</li>
                  <li>• You can only play each day's question once</li>
                  <li>• Questions cover various aspects of rugby or GAA</li>
                  <li>• Difficulty varies to keep the challenge fresh</li>
                  <li>• Come back daily for your next challenge</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Ready to Play?</h2>
            <p className="text-slate-300">Choose your sport and start your TenaBall journey today!</p>
            <div className="flex gap-4 justify-center">
              <Link href="/game/rugby-tenable">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">Play Rugby TenaBall</Button>
              </Link>
              <Link href="/gaa/tenable">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Play GAA TenaBall</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
