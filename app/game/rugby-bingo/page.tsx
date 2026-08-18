"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Share2, RotateCcw, Trophy, Menu, BarChart3, Settings, Star, SkipForward } from "lucide-react"
import Link from "next/link"
import { NavigationMenu } from "@/components/navigation-menu"

interface BingoCategory {
  id: string
  name: string
  icon: string
  type: "country" | "competition" | "achievement" | "position"
  color: string
}

interface PlayerData {
  name: string
  country: string
  competitions: string[]
  achievements: string[]
  position: string
  caps: number
  isActive: boolean
}

interface DailyBingoGame {
  id: number
  title: string
  description: string
  categories: BingoCategory[]
  playerSequence: string[]
  playerData: Record<string, { categories: string[] }>
  difficulty: "Easy" | "Medium" | "Hard"
  createdAt: string
  isActive: boolean
  isDaily: boolean
  date: string
}

export default function RugbyBingoPage() {
  const [selectedCells, setSelectedCells] = useState<Record<string, string>>({})
  const [completedLines, setCompletedLines] = useState<number[]>([])
  const [correctChoices, setCorrectChoices] = useState(0)
  const [wrongChoices, setWrongChoices] = useState(0)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [currentGame, setCurrentGame] = useState<DailyBingoGame | null>(null)
  const [skipsRemaining, setSkipsRemaining] = useState(3)
  const [skipTurn, setSkipTurn] = useState(false)
  const [wildcardUsed, setWildcardUsed] = useState(false)
  const [wildcardActive, setWildcardActive] = useState(false)
  const [wildcardFirstSelection, setWildcardFirstSelection] = useState<number | null>(null)
  const [navigationOpen, setNavigationOpen] = useState(false)

  // Load or generate today's game
  useEffect(() => {
    const today = new Date().toDateString()
    const savedGame = localStorage.getItem("rugbyBingoDailyGame")

    if (savedGame) {
      const game: DailyBingoGame = JSON.parse(savedGame)
      if (game.date === today) {
        setCurrentGame(game)
        return
      }
    }

    // Generate new game for today
    generateTodaysGame()
  }, [])

  const generateTodaysGame = () => {
    // This would normally be called from the admin panel
    // For now, we'll create a fallback game
    const fallbackGame: DailyBingoGame = {
      id: Date.now(),
      title: "Daily Rugby Bingo",
      description: "Match rugby legends to their countries, competitions, and achievements",
      categories: [
        { id: "new-zealand", name: "New Zealand", icon: "🇳🇿", type: "country", color: "bg-black" },
        { id: "australia", name: "Australia", icon: "🇦🇺", type: "country", color: "bg-yellow-500" },
        { id: "south-africa", name: "South Africa", icon: "🇿🇦", type: "country", color: "bg-green-600" },
        { id: "england", name: "England", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", type: "country", color: "bg-red-600" },
        { id: "france", name: "France", icon: "🇫🇷", type: "country", color: "bg-blue-500" },
        { id: "wales", name: "Wales", icon: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", type: "country", color: "bg-red-500" },
        { id: "ireland", name: "Ireland", icon: "🇮🇪", type: "country", color: "bg-green-500" },
        { id: "scotland", name: "Scotland", icon: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", type: "country", color: "bg-blue-600" },
        { id: "six-nations", name: "Six Nations", icon: "👑", type: "competition", color: "bg-purple-600" },
        { id: "super-rugby", name: "Super Rugby", icon: "⚡", type: "competition", color: "bg-blue-600" },
        { id: "champions-cup", name: "Champions Cup", icon: "🌟", type: "competition", color: "bg-indigo-600" },
        { id: "lions", name: "British & Irish Lions", icon: "🦁", type: "competition", color: "bg-orange-600" },
        { id: "world-cup-winner", name: "World Cup Winner", icon: "🏆", type: "achievement", color: "bg-yellow-600" },
        { id: "grand-slam", name: "Grand Slam Winner", icon: "👑", type: "achievement", color: "bg-purple-500" },
        { id: "100-caps", name: "100+ Caps", icon: "💪", type: "achievement", color: "bg-red-500" },
        { id: "top-try-scorer", name: "Top Try Scorer", icon: "⚡", type: "achievement", color: "bg-blue-500" },
      ],
      playerSequence: [
        "Richie McCaw",
        "Dan Carter",
        "Jonny Wilkinson",
        "Brian O'Driscoll",
        "Sergio Parisse",
        "David Pocock",
        "Alun Wyn Jones",
        "Owen Farrell",
        "Antoine Dupont",
        "Siya Kolisi",
        "Beauden Barrett",
        "Maro Itoje",
        "Romain Ntamack",
        "Marcus Smith",
        "Cheslin Kolbe",
        "Ardie Savea",
        "Tadhg Furlong",
        "Manu Tuilagi",
        "George North",
        "Stuart Hogg",
        "Johnny Sexton",
        "Eben Etzebeth",
        "Faf de Klerk",
        "Finn Russell",
        "Jonah Lomu",
        "Martin Johnson",
        "Jason Robinson",
        "Shane Williams",
        "Bryan Habana",
        "Gareth Edwards",
      ],
      playerData: {
        "Richie McCaw": { categories: ["new-zealand", "super-rugby", "world-cup-winner", "100-caps"] },
        "Dan Carter": { categories: ["new-zealand", "super-rugby", "world-cup-winner"] },
        "Jonny Wilkinson": { categories: ["england", "six-nations", "world-cup-winner"] },
        "Brian O'Driscoll": { categories: ["ireland", "six-nations", "lions", "100-caps"] },
        "Sergio Parisse": { categories: ["italy", "six-nations", "100-caps"] },
        "David Pocock": { categories: ["australia", "super-rugby"] },
        "Alun Wyn Jones": { categories: ["wales", "six-nations", "lions", "100-caps"] },
        "Owen Farrell": { categories: ["england", "six-nations", "lions"] },
        "Antoine Dupont": { categories: ["france", "six-nations", "champions-cup"] },
        "Siya Kolisi": { categories: ["south-africa", "super-rugby", "world-cup-winner"] },
        "Beauden Barrett": { categories: ["new-zealand", "super-rugby"] },
        "Maro Itoje": { categories: ["england", "six-nations", "lions"] },
        "Romain Ntamack": { categories: ["france", "six-nations", "champions-cup"] },
        "Marcus Smith": { categories: ["england", "six-nations"] },
        "Cheslin Kolbe": { categories: ["south-africa", "world-cup-winner", "top-try-scorer"] },
        "Ardie Savea": { categories: ["new-zealand", "super-rugby"] },
        "Tadhg Furlong": { categories: ["ireland", "six-nations", "lions"] },
        "Manu Tuilagi": { categories: ["england", "six-nations"] },
        "George North": { categories: ["wales", "six-nations", "lions", "top-try-scorer"] },
        "Stuart Hogg": { categories: ["scotland", "six-nations", "lions"] },
        "Johnny Sexton": { categories: ["ireland", "six-nations", "lions", "100-caps"] },
        "Eben Etzebeth": { categories: ["south-africa", "world-cup-winner", "100-caps"] },
        "Faf de Klerk": { categories: ["south-africa", "world-cup-winner"] },
        "Finn Russell": { categories: ["scotland", "six-nations", "lions"] },
        "Jonah Lomu": { categories: ["new-zealand", "super-rugby", "top-try-scorer"] },
        "Martin Johnson": { categories: ["england", "six-nations", "lions", "world-cup-winner"] },
        "Jason Robinson": { categories: ["england", "six-nations", "lions", "world-cup-winner"] },
        "Shane Williams": { categories: ["wales", "six-nations", "lions", "top-try-scorer"] },
        "Bryan Habana": { categories: ["south-africa", "super-rugby", "world-cup-winner", "top-try-scorer"] },
        "Gareth Edwards": { categories: ["wales", "lions", "grand-slam"] },
      },
      difficulty: "Medium",
      createdAt: new Date().toISOString(),
      isActive: true,
      isDaily: true,
      date: new Date().toDateString(),
    }

    setCurrentGame(fallbackGame)
    localStorage.setItem("rugbyBingoDailyGame", JSON.stringify(fallbackGame))
  }

  const currentPlayer = gameStarted && currentGame ? currentGame.playerSequence[currentPlayerIndex] : null

  const handleCellClick = (index: number) => {
    if (!currentGame || !currentPlayer || gameComplete || showFeedback || skipTurn) return

    const category = currentGame.categories[index]
    const playerMatches = checkPlayerMatch(currentPlayer, category.id)

    // Handle wildcard mode
    if (wildcardActive) {
      if (wildcardFirstSelection === null) {
        // First selection in wildcard mode
        if (playerMatches) {
          setWildcardFirstSelection(index)
          setShowFeedback({
            correct: true,
            message: `Correct! Now select a second category for ${currentPlayer}`,
          })
        } else {
          setWildcardActive(false)
          setWildcardUsed(true)
          setWrongChoices(wrongChoices + 1)
          setSkipTurn(true)
          setShowFeedback({
            correct: false,
            message: `Wrong! ${currentPlayer} is not associated with ${category.name}. You miss a turn.`,
          })

          setTimeout(() => {
            setShowFeedback(null)
            setTimeout(() => {
              setSkipTurn(false)
              advanceToNextPlayer()
            }, 1000)
          }, 2000)
        }
        return
      } else {
        // Second selection in wildcard mode
        if (wildcardFirstSelection === index) {
          // Can't select the same cell twice
          return
        }

        if (playerMatches) {
          // Success! Apply both selections
          const newSelected = { ...selectedCells }
          const firstCategory = currentGame.categories[wildcardFirstSelection]

          newSelected[wildcardFirstSelection.toString()] = currentPlayer
          newSelected[index.toString()] = currentPlayer

          setSelectedCells(newSelected)
          setCorrectChoices(correctChoices + 2)
          setWildcardActive(false)
          setWildcardUsed(true)
          setWildcardFirstSelection(null)

          setShowFeedback({
            correct: true,
            message: `Wildcard success! ${currentPlayer} added to ${firstCategory.name} and ${category.name}`,
          })

          checkForCompletedLines(newSelected)

          setTimeout(() => {
            setShowFeedback(null)
            advanceToNextPlayer()
          }, 2000)
        } else {
          // Failed second selection
          setWildcardActive(false)
          setWildcardUsed(true)
          setWildcardFirstSelection(null)
          setWrongChoices(wrongChoices + 1)
          setSkipTurn(true)

          setShowFeedback({
            correct: false,
            message: `Wrong! ${currentPlayer} is not associated with ${category.name}. You miss a turn.`,
          })

          setTimeout(() => {
            setShowFeedback(null)
            setTimeout(() => {
              setSkipTurn(false)
              advanceToNextPlayer()
            }, 1000)
          }, 2000)
        }
        return
      }
    }

    // Normal mode (non-wildcard)
    if (playerMatches) {
      const newSelected = { ...selectedCells }
      newSelected[index.toString()] = currentPlayer
      setSelectedCells(newSelected)
      setCorrectChoices(correctChoices + 1)

      setShowFeedback({
        correct: true,
        message: `Correct! ${currentPlayer} is associated with ${category.name}`,
      })

      checkForCompletedLines(newSelected)

      setTimeout(() => {
        setShowFeedback(null)
        advanceToNextPlayer()
      }, 2000)
    } else {
      setWrongChoices(wrongChoices + 1)
      setSkipTurn(true)

      setShowFeedback({
        correct: false,
        message: `Wrong! ${currentPlayer} is not associated with ${category.name}. You miss a turn.`,
      })

      setTimeout(() => {
        setShowFeedback(null)
        setTimeout(() => {
          setSkipTurn(false)
          advanceToNextPlayer()
        }, 1000)
      }, 2000)
    }
  }

  const advanceToNextPlayer = () => {
    if (!currentGame) return

    if (currentPlayerIndex < currentGame.playerSequence.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1)
    } else {
      setGameComplete(true)
    }

    // Check if all categories are filled
    if (Object.keys(selectedCells).length >= currentGame.categories.length) {
      setGameComplete(true)
    }
  }

  const handleSkip = () => {
    if (skipsRemaining <= 0 || !currentGame || gameComplete || showFeedback || skipTurn) return

    setSkipsRemaining(skipsRemaining - 1)
    advanceToNextPlayer()

    setShowFeedback({
      correct: true,
      message: `Skipped ${currentPlayer}. ${skipsRemaining - 1} skips remaining.`,
    })

    setTimeout(() => {
      setShowFeedback(null)
    }, 1500)
  }

  const activateWildcard = () => {
    if (wildcardUsed || !currentGame || gameComplete || showFeedback || skipTurn) return

    setWildcardActive(true)
    setShowFeedback({
      correct: true,
      message: `Wildcard activated! Select TWO categories for ${currentPlayer}`,
    })

    setTimeout(() => {
      setShowFeedback(null)
    }, 2000)
  }

  const checkPlayerMatch = (player: string, categoryId: string): boolean => {
    if (!currentGame) return false
    const playerData = currentGame.playerData[player]
    return playerData?.categories.includes(categoryId) || false
  }

  const checkForCompletedLines = (selected: Record<string, string>) => {
    if (!currentGame) return

    const lines = [
      [0, 1, 2, 3], // rows
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
      [0, 4, 8, 12], // columns
      [1, 5, 9, 13],
      [2, 6, 10, 14],
      [3, 7, 11, 15],
      [0, 5, 10, 15], // diagonals
      [3, 6, 9, 12],
    ]

    const selectedIndexes = Object.keys(selected).map(Number)
    const newCompleted = lines.filter((line) => line.every((cell) => selectedIndexes.includes(cell)))

    if (newCompleted.length > completedLines.length) {
      setCompletedLines(newCompleted.map((_, index) => index))
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setCurrentPlayerIndex(0)
    setSkipsRemaining(3)
    setWildcardUsed(false)
    setWildcardActive(false)
    setWildcardFirstSelection(null)
    setSkipTurn(false)
  }

  const resetGame = () => {
    setSelectedCells({})
    setCompletedLines([])
    setCorrectChoices(0)
    setWrongChoices(0)
    setCurrentPlayerIndex(0)
    setGameComplete(false)
    setGameStarted(false)
    setShowFeedback(null)
    setSkipsRemaining(3)
    setWildcardUsed(false)
    setWildcardActive(false)
    setWildcardFirstSelection(null)
    setSkipTurn(false)
  }

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Loading Today's Game...</h2>
            <p className="text-slate-400 mb-6">Generating your daily rugby bingo challenge.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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

            <h1 className="text-2xl font-bold text-white tracking-wider">RUGBY BINGO</h1>

            <div className="flex items-center gap-2">
              <Link href="/game/rugby-bingo/admin">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Settings className="w-6 h-6" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <BarChart3 className="w-6 h-6" />
              </Button>
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
            {!gameStarted ? (
              <div className="text-center h-full flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-white mb-4">{currentGame.title}</h2>
                <p className="text-slate-400 mb-8">{currentGame.description}</p>
                <div className="space-y-4 max-w-lg mx-auto mb-8">
                  <div className="bg-slate-800/70 p-4 rounded-lg text-left">
                    <h3 className="text-lime-400 font-bold mb-2">New Game Rules:</h3>
                    <ul className="text-white space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-lime-400 font-bold">1.</span>
                        <span>Assign each player to ONE category on your Bingo card</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-lime-400 font-bold">2.</span>
                        <span>Each player can only be used once - choose wisely!</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-lime-400 font-bold">3.</span>
                        <span>Skip button lets you save a player for later (3 skips per game)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-lime-400 font-bold">4.</span>
                        <span>Wrong picks cause you to miss a turn</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-lime-400 font-bold">5.</span>
                        <span>Use your Wildcard once to assign a player to TWO categories</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <Button
                  onClick={startGame}
                  className="bg-lime-400 hover:bg-lime-500 text-black font-bold px-12 py-4 text-xl mx-auto"
                >
                  Start Game
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Player */}
                <div className="text-center">
                  {currentPlayer && !gameComplete ? (
                    <div className="bg-lime-400 text-black px-8 py-4 rounded-lg font-bold text-2xl">
                      {currentPlayer}
                    </div>
                  ) : gameComplete ? (
                    <div className="bg-slate-600 text-white px-8 py-4 rounded-lg font-bold text-2xl">
                      Game Complete!
                    </div>
                  ) : null}
                </div>

                {/* Action Buttons */}
                {gameStarted && !gameComplete && (
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={handleSkip}
                      disabled={skipsRemaining <= 0 || showFeedback || skipTurn}
                      className={`${
                        skipsRemaining > 0 && !showFeedback && !skipTurn
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-slate-700 cursor-not-allowed"
                      } text-white font-bold`}
                    >
                      <SkipForward className="w-4 h-4 mr-2" />
                      Skip ({skipsRemaining})
                    </Button>

                    <Button
                      onClick={activateWildcard}
                      disabled={wildcardUsed || showFeedback || skipTurn}
                      className={`${
                        !wildcardUsed && !showFeedback && !skipTurn
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-slate-700 cursor-not-allowed"
                      } text-black font-bold`}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Wildcard {wildcardActive && "(Active)"}
                    </Button>
                  </div>
                )}

                {/* Feedback Display */}
                {showFeedback && (
                  <div className="text-center">
                    <div
                      className={`px-6 py-3 rounded-lg font-bold ${
                        showFeedback.correct ? "bg-green-600 text-white" : "bg-red-600 text-white"
                      }`}
                    >
                      {showFeedback.message}
                    </div>
                  </div>
                )}

                {/* Skip Turn Indicator */}
                {skipTurn && !showFeedback && (
                  <div className="text-center">
                    <div className="px-6 py-3 rounded-lg font-bold bg-orange-600 text-white">
                      You missed a turn! Next player coming up...
                    </div>
                  </div>
                )}

                {/* 4x4 Bingo Grid with Icons */}
                <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
                  {currentGame.categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      disabled={
                        selectedCells[index.toString()] !== undefined ||
                        !currentPlayer ||
                        gameComplete ||
                        showFeedback ||
                        skipTurn
                      }
                      className={`aspect-square p-2 text-lg font-bold rounded-lg border-2 transition-all ${
                        selectedCells[index.toString()] !== undefined
                          ? "bg-lime-400 text-black border-lime-400"
                          : wildcardActive && wildcardFirstSelection === index
                            ? "bg-yellow-400 text-black border-yellow-400"
                            : showFeedback || skipTurn
                              ? "bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed"
                              : currentPlayer
                                ? `${category.color} text-white border-slate-600 hover:border-lime-400 hover:scale-105`
                                : `${category.color} text-white border-slate-600`
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1 h-full justify-between">
                        <div className="text-2xl">{category.icon}</div>
                        <div className="text-xs text-center leading-tight">{category.name}</div>
                        {selectedCells[index.toString()] && (
                          <div className="text-xs font-normal mt-1 bg-black/30 px-2 py-1 rounded-full w-full truncate">
                            {selectedCells[index.toString()]}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Progress */}
                <div className="text-center">
                  <div className="flex justify-center gap-8 text-sm mb-4">
                    <div className="text-green-400">Correct: {correctChoices}</div>
                    <div className="text-red-400">Wrong: {wrongChoices}</div>
                    <div className="text-blue-400">
                      Filled: {Object.keys(selectedCells).length}/{currentGame.categories.length}
                    </div>
                    <div className="text-purple-400">Lines: {completedLines.length}</div>
                  </div>

                  <div className="w-full bg-slate-700 rounded-full h-2 max-w-md mx-auto">
                    <div
                      className="bg-lime-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(Object.keys(selectedCells).length / currentGame.categories.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {gameComplete && (
              <div className="text-center mt-8">
                <div className="bg-green-900/50 border border-green-700 rounded-lg p-6">
                  <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Bingo Complete!</h3>
                  <p className="text-green-300 font-bold mb-2">
                    You filled {Object.keys(selectedCells).length} out of {currentGame.categories.length} boxes!
                  </p>
                  <p className="text-green-300 font-bold mb-2">Correct answers: {correctChoices}</p>
                  {completedLines.length > 0 && (
                    <p className="text-yellow-300 font-bold mb-4">
                      🎉 BONUS! {completedLines.length} line(s) completed!
                    </p>
                  )}
                  <p className="text-slate-400 mb-6">
                    Accuracy:{" "}
                    {correctChoices > 0 ? Math.round((correctChoices / (correctChoices + wrongChoices)) * 100) : 0}%
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button className="bg-lime-400 hover:bg-lime-500 text-black font-bold">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Score
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={resetGame}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
