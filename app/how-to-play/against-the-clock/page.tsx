import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Zap, Trophy, Target } from "lucide-react"

export default function AgainstTheClockHowToPlayPage() {
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
            <h1 className="text-white text-xl font-bold">How to Play Against the Clock</h1>
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
                <Clock className="w-8 h-8 text-blue-400" />
                Against the Clock Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p className="text-lg">
                Against the Clock is our fast-paced, adrenaline-pumping quiz format that tests your sports knowledge
                under intense time pressure. It's designed for players who thrive on quick thinking and love the thrill
                of racing against time.
              </p>
              <p>
                Unlike traditional timed quizzes, our unique time bonus system rewards knowledge and speed, allowing
                skilled players to extend their games indefinitely through accurate and rapid responses.
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
                  <h3 className="text-lg font-semibold text-white mb-3">Timer System</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Start with 30 seconds on the clock</li>
                    <li>• Timer counts down continuously</li>
                    <li>• Game ends when timer reaches zero</li>
                    <li>• No pausing or stopping the clock</li>
                    <li>• Pressure builds as time decreases</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Time Bonus</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• +20 seconds for each correct answer</li>
                    <li>• Bonus applied immediately</li>
                    <li>• No limit to total time possible</li>
                    <li>• Skilled players can play indefinitely</li>
                    <li>• Risk vs. reward decision making</li>
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
                  <div className="w-8 h-8 bg-blue-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Read the Question</h4>
                    <p className="text-sm">
                      Quickly scan the question to understand what answers are needed. Note how many answers are
                      required.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Start the Timer</h4>
                    <p className="text-sm">
                      Click "Start Challenge" to begin your 30-second countdown. The pressure is on!
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Type Fast and Accurate</h4>
                    <p className="text-sm">
                      Enter answers quickly. Each correct answer gives you 20 more seconds to find additional answers.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Beat the Clock</h4>
                    <p className="text-sm">
                      Find all answers before time runs out, or see how many you can get with your time bonuses.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Guide */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Zap className="w-6 h-6 text-yellow-400" />
                Strategy and Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Speed Strategies</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Start with the most obvious answers</li>
                    <li>• Use abbreviations when possible</li>
                    <li>• Don't second-guess yourself</li>
                    <li>• Type while thinking of the next answer</li>
                    <li>• Practice common sports terms</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Time Management</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Get early answers to build time buffer</li>
                    <li>• Don't spend too long on difficult answers</li>
                    <li>• Watch the timer but don't panic</li>
                    <li>• Save harder answers for when you have more time</li>
                    <li>• Remember: each answer buys you 20 more seconds</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pressure Management */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Target className="w-6 h-6 text-red-400" />
                Handling the Pressure
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                Against the Clock is designed to create pressure, but the best players learn to use that pressure as
                motivation rather than letting it overwhelm them. Here's how to stay calm under pressure:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Mental Preparation</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Take a deep breath before starting</li>
                    <li>• Focus on accuracy over speed initially</li>
                    <li>• Trust your first instincts</li>
                    <li>• Don't watch the timer constantly</li>
                    <li>• Stay positive even if time gets low</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Recovery Techniques</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• If you get an answer, you've bought more time</li>
                    <li>• Use the 20-second bonus to regroup</li>
                    <li>• Don't panic with 10 seconds left</li>
                    <li>• One correct answer can change everything</li>
                    <li>• Practice makes pressure feel normal</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring System */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Scoring and Achievement
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Basic Scoring</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 1 point per correct answer</li>
                    <li>• No penalty for wrong answers</li>
                    <li>• Score based on total found</li>
                    <li>• Perfect score = all answers found</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Achievement Levels</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 🍀 Better Luck Next Time (0 answers)</li>
                    <li>• ⏱️ Time's Up! (1+ answers)</li>
                    <li>• 🎉 Perfect Score! (all answers)</li>
                    <li>• Special recognition for speed</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Daily Challenge</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• New question every day</li>
                    <li>• Unlimited attempts per day</li>
                    <li>• Track your best daily score</li>
                    <li>• Share your achievements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Ready for the Challenge?</h2>
            <p className="text-slate-300">
              Test your knowledge against the clock and see how many answers you can find!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/game/against-the-clock">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">Play Rugby Against the Clock</Button>
              </Link>
              <Link href="/gaa/against-the-clock">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Play GAA Against the Clock</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
