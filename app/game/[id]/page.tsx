"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Share2, RotateCcw, Trophy, X, Check } from "lucide-react"
import Link from "next/link"

interface GameData {
  id: string
  title: string
  description: string
  type: "list" | "bingo" | "tenable" | "connections" | "wordle" | "grid"
}

const gameData: Record<string, GameData> = {
  "rugby-list-a": {
    id: "rugby-list-a",
    title: "Rugby List A",
    description: "Daily rugby list quiz",
    type: "list",
  },
  "rugby-bingo": {
    id: "rugby-bingo",
    title: "Rugby Bingo",
    description: "Complete the bingo card in the least turns",
    type: "bingo",
  },
  "rugby-tenable": {
    id: "rugby-tenable",
    title: "Rugby TenaBall",
    description: "Find the top 10 rugby tenable answers",
    type: "tenable",
  },
  "rugby-connections": {
    id: "rugby-connections",
    title: "Rugby Connections",
    description: "Find the 4 links between the players",
    type: "connections",
  },
  "rugby-wordle": {
    id: "rugby-wordle",
    title: "Rugby Wordle",
    description: "Guess the rugby player in 6 tries",
    type: "wordle",
  },
  "rugby-grid": {
    id: "rugby-grid",
    title: "Rugby Grid",
    description: "Complete the 3x3 grid with correct players",
    type: "grid",
  },
}

// Rugby List A Component
function RugbyListGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [userAnswers, setUserAnswers] = useState<string[]>([])

  const questions = [
    {
      question: "Name 10 countries that have won the Rugby World Cup",
      answers: [
        "New Zealand",
        "Australia",
        "South Africa",
        "England",
        "France",
        "Wales",
        "Argentina",
        "Japan",
        "Ireland",
        "Scotland",
      ],
      correctAnswers: ["New Zealand", "Australia", "South Africa", "England"],
    },
    {
      question: "Name 10 Rugby World Cup winning captains",
      answers: [
        "Richie McCaw",
        "John Eales",
        "Francois Pienaar",
        "Martin Johnson",
        "David Kirk",
        "Nick Farr-Jones",
        "John Smit",
        "Siya Kolisi",
      ],
      correctAnswers: [
        "Richie McCaw",
        "John Eales",
        "Francois Pienaar",
        "Martin Johnson",
        "David Kirk",
        "Nick Farr-Jones",
        "John Smit",
        "Siya Kolisi",
      ],
    },
  ]

  const [currentAnswer, setCurrentAnswer] = useState("")

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return

    const newAnswers = [...userAnswers, currentAnswer]
    setUserAnswers(newAnswers)

    if (
      questions[currentQuestion].correctAnswers.some(
        (answer) =>
          answer.toLowerCase().includes(currentAnswer.toLowerCase()) ||
          currentAnswer.toLowerCase().includes(answer.toLowerCase()),
      )
    ) {
      setScore(score + 1)
    }

    setCurrentAnswer("")

    if (newAnswers.length >= 10) {
      setGameComplete(true)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">{questions[currentQuestion].question}</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmitAnswer()}
                placeholder="Enter your answer..."
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-lime-400"
              />
              <Button onClick={handleSubmitAnswer} className="bg-lime-400 hover:bg-lime-500 text-black font-bold">
                Submit
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {userAnswers.map((answer, index) => (
                <div key={index} className="bg-slate-700 px-3 py-2 rounded text-white text-sm">
                  {index + 1}. {answer}
                </div>
              ))}
            </div>

            <div className="text-slate-400">
              Answers: {userAnswers.length}/10 | Score: {score}
            </div>
          </div>
        </CardContent>
      </Card>

      {gameComplete && (
        <Card className="bg-green-900/50 border-green-700">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Game Complete!</h3>
            <p className="text-green-300 mb-4">You scored {score} out of 10!</p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-lime-400 hover:bg-lime-500 text-black font-bold">
                <Share2 className="w-4 h-4 mr-2" />
                Share Score
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Rugby Bingo Component
function RugbyBingoGame() {
  const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set())
  const [completedLines, setCompletedLines] = useState<number[]>([])
  const [correctChoices, setCorrectChoices] = useState(0)
  const [wrongChoices, setWrongChoices] = useState(0)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; message: string } | null>(null)

  // 3x3 Bingo Grid - Players, Competitions, Countries
  const bingoItems = [
    "New Zealand",
    "Six Nations",
    "South Africa",
    "World Cup",
    "England",
    "Super Rugby",
    "France",
    "Champions Cup",
    "Australia",
  ]

  // 20 players in order
  const playerSequence = [
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
  ]

  const currentPlayer = gameStarted ? playerSequence[currentPlayerIndex] : null

  const handleCellClick = (index: number) => {
    if (selectedCells.has(index) || !currentPlayer || gameComplete || showFeedback) return

    // Check if the current player matches the category
    const category = bingoItems[index]
    const playerMatches = checkPlayerMatch(currentPlayer, category)

    if (playerMatches) {
      const newSelected = new Set(selectedCells)
      newSelected.add(index)
      setSelectedCells(newSelected)
      setCorrectChoices(correctChoices + 1)

      // Show success feedback
      setShowFeedback({
        correct: true,
        message: `Correct! ${currentPlayer} is associated with ${category}`,
      })

      // Check for completed lines
      checkForCompletedLines(newSelected)
    } else {
      setWrongChoices(wrongChoices + 1)
      // Show error feedback
      setShowFeedback({
        correct: false,
        message: `Wrong! ${currentPlayer} is not associated with ${category}`,
      })
    }

    // Move to next player after 2 seconds
    setTimeout(() => {
      setShowFeedback(null)
      if (currentPlayerIndex < playerSequence.length - 1) {
        setCurrentPlayerIndex(currentPlayerIndex + 1)
      } else {
        setGameComplete(true)
      }
    }, 2000)
  }

  const checkPlayerMatch = (player: string, category: string): boolean => {
    // Define player associations
    const playerData: Record<string, { country: string; competitions: string[] }> = {
      "Richie McCaw": { country: "New Zealand", competitions: ["World Cup", "Super Rugby"] },
      "Dan Carter": { country: "New Zealand", competitions: ["World Cup", "Super Rugby"] },
      "Jonny Wilkinson": { country: "England", competitions: ["World Cup", "Six Nations"] },
      "Brian O'Driscoll": { country: "Ireland", competitions: ["Six Nations", "Champions Cup"] },
      "Sergio Parisse": { country: "Italy", competitions: ["Six Nations", "Champions Cup"] },
      "David Pocock": { country: "Australia", competitions: ["World Cup", "Super Rugby"] },
      "Alun Wyn Jones": { country: "Wales", competitions: ["Six Nations", "Champions Cup"] },
      "Owen Farrell": { country: "England", competitions: ["Six Nations", "Champions Cup"] },
      "Antoine Dupont": { country: "France", competitions: ["Six Nations", "Champions Cup"] },
      "Siya Kolisi": { country: "South Africa", competitions: ["World Cup", "Super Rugby"] },
      "Beauden Barrett": { country: "New Zealand", competitions: ["World Cup", "Super Rugby"] },
      "Maro Itoje": { country: "England", competitions: ["Six Nations", "Champions Cup"] },
      "Romain Ntamack": { country: "France", competitions: ["Six Nations", "Champions Cup"] },
      "Marcus Smith": { country: "England", competitions: ["Six Nations", "Champions Cup"] },
      "Cheslin Kolbe": { country: "South Africa", competitions: ["World Cup", "Super Rugby"] },
      "Ardie Savea": { country: "New Zealand", competitions: ["World Cup", "Super Rugby"] },
      "Tadhg Furlong": { country: "Ireland", competitions: ["Six Nations", "Champions Cup"] },
      "Manu Tuilagi": { country: "England", competitions: ["Six Nations", "Champions Cup"] },
      "George North": { country: "Wales", competitions: ["Six Nations", "Champions Cup"] },
      "Stuart Hogg": { country: "Scotland", competitions: ["Six Nations", "Champions Cup"] },
    }

    const data = playerData[player]
    if (!data) return false

    // Check if player matches the category
    if (data.country === category) return true
    if (data.competitions.includes(category)) return true

    return false
  }

  const checkForCompletedLines = (selected: Set<number>) => {
    // Check rows, columns, and diagonals for 3x3 grid
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ]

    const newCompleted = lines.filter((line) => line.every((cell) => selected.has(cell)))

    if (newCompleted.length > completedLines.length) {
      setCompletedLines(newCompleted.map((_, index) => index))
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setCurrentPlayerIndex(0)
  }

  const resetGame = () => {
    setSelectedCells(new Set())
    setCompletedLines([])
    setCorrectChoices(0)
    setWrongChoices(0)
    setCurrentPlayerIndex(0)
    setGameComplete(false)
    setGameStarted(false)
    setShowFeedback(null)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Rugby Bingo</h3>
            <p className="text-slate-400 mb-4">Guess which category each player belongs to!</p>
            <div className="flex justify-center gap-8 text-sm mb-4">
              <div className="text-green-400">Correct: {correctChoices}</div>
              <div className="text-red-400">Wrong: {wrongChoices}</div>
              <div className="text-blue-400">Lines: {completedLines.length}</div>
              <div className="text-purple-400">Player: {currentPlayerIndex + 1}/20</div>
            </div>
          </div>

          {!gameStarted ? (
            <div className="text-center">
              <Button
                onClick={startGame}
                className="bg-lime-400 hover:bg-lime-500 text-black font-bold px-8 py-4 text-lg"
              >
                Start Bingo Game
              </Button>
              <p className="text-slate-400 mt-4">20 players will appear. Guess their country or main competition!</p>
            </div>
          ) : (
            <>
              {/* Current Player Display */}
              <div className="text-center mb-6">
                {currentPlayer && !gameComplete ? (
                  <div className="bg-lime-400 text-black px-6 py-4 rounded-lg font-bold text-xl">{currentPlayer}</div>
                ) : gameComplete ? (
                  <div className="bg-slate-600 text-white px-6 py-4 rounded-lg font-bold text-xl">Game Complete!</div>
                ) : null}
              </div>

              {/* Feedback Display */}
              {showFeedback && (
                <div className="text-center mb-6">
                  <div
                    className={`px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${
                      showFeedback.correct ? "bg-green-600 text-white" : "bg-red-600 text-white"
                    }`}
                  >
                    {showFeedback.correct ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    {showFeedback.message}
                  </div>
                </div>
              )}

              {/* 3x3 Bingo Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
                {bingoItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={!currentPlayer || gameComplete || showFeedback}
                    className={`aspect-square p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                      selectedCells.has(index)
                        ? "bg-lime-400 text-black border-lime-400"
                        : showFeedback
                          ? "bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed"
                          : currentPlayer
                            ? "bg-slate-700 text-white border-slate-600 hover:border-slate-500 hover:bg-slate-600"
                            : "bg-slate-700 text-white border-slate-600"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>{currentPlayerIndex}/20</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-lime-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentPlayerIndex / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Player Sequence Display */}
              <div className="text-center">
                <h4 className="text-white font-semibold mb-2">Player Sequence:</h4>
                <div className="flex flex-wrap justify-center gap-1 max-h-32 overflow-y-auto">
                  {playerSequence.map((player, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs ${
                        index === currentPlayerIndex && gameStarted && !gameComplete
                          ? "bg-lime-400 text-black font-bold"
                          : index < currentPlayerIndex
                            ? "bg-green-600 text-white"
                            : "bg-slate-600 text-slate-300"
                      }`}
                    >
                      {index + 1}. {player}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {gameComplete && (
            <div className="text-center mt-6">
              <div className="bg-green-900/50 border border-green-700 rounded-lg p-4">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-green-300 font-bold">Game Complete! You got {correctChoices} out of 20 correct!</p>
                {completedLines.length > 0 && (
                  <p className="text-yellow-300 font-bold">🎉 BINGO! {completedLines.length} line(s) completed!</p>
                )}
                <p className="text-slate-400 mb-4">
                  Accuracy: {Math.round((correctChoices / 20) * 100)}%
                  {completedLines.length > 0 && ` + ${completedLines.length} Bingo Bonus!`}
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
  )
}

// Rugby TenaBall Component
function RugbyTenaBallGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [foundAnswers, setFoundAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [gameComplete, setGameComplete] = useState(false)
  const [strikes, setStrikes] = useState(0)
  const [score, setScore] = useState(0)

  const questions = [
    {
      question: "Last 10 Champions Cup Winners",
      description: "Name the last 10 teams to win the European Rugby Champions Cup (including Heineken Cup)",
      answers: [
        { text: "La Rochelle", year: "2022, 2023" },
        { text: "Toulouse", year: "2021" },
        { text: "Exeter Chiefs", year: "2020" },
        { text: "Saracens", year: "2016, 2017, 2019" },
        { text: "Racing 92", year: "2018" },
        { text: "Toulon", year: "2013, 2014, 2015" },
        { text: "Leinster", year: "2012, 2018" },
        { text: "Clermont", year: "2017" },
        { text: "Munster", year: "2006, 2008" },
        { text: "Leicester Tigers", year: "2001, 2002" },
      ],
      maxStrikes: 3,
    },
  ]

  const currentQ = questions[currentQuestion]

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return

    const normalizedAnswer = currentAnswer.toLowerCase().trim()
    const matchedAnswer = currentQ.answers.find(
      (answer) =>
        answer.text.toLowerCase().includes(normalizedAnswer) ||
        normalizedAnswer.includes(answer.text.toLowerCase()) ||
        answer.text
          .toLowerCase()
          .split(" ")
          .some((word) => normalizedAnswer.includes(word) && word.length > 3),
    )

    if (matchedAnswer && !foundAnswers.includes(matchedAnswer.text)) {
      setFoundAnswers([...foundAnswers, matchedAnswer.text])
      setScore(score + 1)
      setCurrentAnswer("")

      if (foundAnswers.length + 1 >= 10) {
        setGameComplete(true)
      }
    } else if (!foundAnswers.includes(currentAnswer)) {
      setStrikes(strikes + 1)
      setCurrentAnswer("")

      if (strikes + 1 >= currentQ.maxStrikes) {
        setGameComplete(true)
      }
    }
  }

  const resetGame = () => {
    setFoundAnswers([])
    setCurrentAnswer("")
    setGameComplete(false)
    setStrikes(0)
    setScore(0)
  }

  // Tenable Ladder Component
  const TenableLadder = () => {
    return (
      <div className="flex flex-col items-center">
        <div className="text-white font-bold text-lg mb-4">TENABLE LADDER</div>
        <div className="relative">
          {/* Ladder Structure */}
          <div className="flex flex-col-reverse gap-1">
            {Array.from({ length: 10 }, (_, index) => {
              const level = index + 1
              const isFound = foundAnswers.length >= level
              const isActive = foundAnswers.length === level - 1 && !gameComplete

              return (
                <div
                  key={level}
                  className={`relative w-48 h-12 border-2 rounded-lg transition-all duration-500 ${
                    isFound
                      ? "bg-gradient-to-r from-green-500 to-green-600 border-green-400 shadow-lg shadow-green-500/50"
                      : isActive
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 shadow-lg shadow-yellow-500/50 animate-pulse"
                        : "bg-slate-700 border-slate-600"
                  }`}
                >
                  {/* Level Number */}
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isFound
                          ? "bg-white text-green-600"
                          : isActive
                            ? "bg-white text-yellow-600"
                            : "bg-slate-600 text-slate-400"
                      }`}
                    >
                      {level}
                    </div>
                  </div>

                  {/* Level Content */}
                  <div className="flex items-center justify-center h-full pl-12 pr-4">
                    <div
                      className={`font-semibold text-center ${
                        isFound ? "text-white" : isActive ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {isFound ? "✓ FOUND" : isActive ? "NEXT TARGET" : "LOCKED"}
                    </div>
                  </div>

                  {/* Connecting Lines */}
                  {level < 10 && (
                    <div
                      className={`absolute left-6 -top-1 w-0.5 h-2 ${
                        foundAnswers.length >= level ? "bg-green-400" : "bg-slate-600"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Trophy at the top */}
          <div className="flex justify-center mt-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                foundAnswers.length >= 10
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/50 animate-bounce"
                  : "bg-slate-700 border-2 border-slate-600"
              }`}
            >
              <Trophy className={`w-8 h-8 ${foundAnswers.length >= 10 ? "text-white" : "text-slate-400"}`} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{currentQ.question}</h3>
            <p className="text-slate-400 mb-4">{currentQ.description}</p>
            <div className="flex justify-center gap-8 text-sm">
              <div className="text-green-400">Found: {foundAnswers.length}/10</div>
              <div className="text-red-400">
                Strikes: {strikes}/{currentQ.maxStrikes}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Game Interface */}
            <div className="space-y-6">
              {!gameComplete && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSubmitAnswer()}
                      placeholder="Enter a team name..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-lime-400"
                    />
                    <Button onClick={handleSubmitAnswer} className="bg-lime-400 hover:bg-lime-500 text-black font-bold">
                      Submit
                    </Button>
                  </div>
                </div>
              )}

              {/* Answer Grid */}
              <div className="space-y-2">
                <h4 className="text-white font-semibold mb-3">Answers Found:</h4>
                {currentQ.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      foundAnswers.includes(answer.text)
                        ? "bg-green-900/50 border-green-500 text-green-300"
                        : gameComplete
                          ? "bg-slate-700/50 border-slate-600 text-slate-400"
                          : "bg-slate-800/50 border-slate-700 text-slate-500"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {foundAnswers.includes(answer.text) || gameComplete ? answer.text : `${index + 1}. ???`}
                      </span>
                      {(foundAnswers.includes(answer.text) || gameComplete) && (
                        <span className="text-sm opacity-75">{answer.year}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Tenable Ladder */}
            <div className="flex justify-center">
              <TenableLadder />
            </div>
          </div>
        </CardContent>
      </Card>

      {gameComplete && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Game Complete!</h3>
            <p className="text-slate-300 mb-4">
              You found {foundAnswers.length} out of 10 answers!
              {strikes >= currentQ.maxStrikes && " (Maximum strikes reached)"}
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function GamePage({ params }: { params: { id: string } }) {
  const game = gameData[params.id]

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <Link href="/">
            <Button className="bg-lime-400 hover:bg-lime-500 text-black font-bold">Back to Games</Button>
          </Link>
        </div>
      </div>
    )
  }

  const renderGame = () => {
    switch (game.type) {
      case "list":
        return <RugbyListGame />
      case "bingo":
        return <RugbyBingoGame />
      case "tenable":
        return <RugbyTenaBallGame />
      default:
        return (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-4">{game.title}</h3>
              <p className="text-slate-400 mb-6">This game is coming soon!</p>
              <Link href="/">
                <Button className="bg-lime-400 hover:bg-lime-500 text-black font-bold">Back to Games</Button>
              </Link>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div className="text-center">
              <div className="text-lime-400 font-semibold text-sm">Play Rugby Games</div>
              <h1 className="text-white font-bold text-lg">{game.title}</h1>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Share2 className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="container mx-auto px-4 pb-8">{renderGame()}</main>
    </div>
  )
}
