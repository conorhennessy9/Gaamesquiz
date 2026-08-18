"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Trophy, Info, AlertCircle, Settings } from "lucide-react"
import Link from "next/link"
import { findBestMatch } from "@/lib/answer-utils"
import { getCurrentGMTDateString, formatDisplayDate } from "@/lib/date-utils"
import { getRugbyClockQuestionByDate } from "./actions"
import { AnswerAutocomplete } from "@/components/answer-autocomplete"

interface RugbyClockQuestion {
  id: number
  question_text: string
  answers: string[]
  question_date: string
}

// Default question as fallback
const DEFAULT_QUESTION = {
  question_text: "Name the Rugby World Cup winning countries",
  answers: ["South Africa", "New Zealand", "Australia", "England"],
}

// Initial time and time bonus settings
const INITIAL_TIME = 30 // Starting with 30 seconds
const TIME_BONUS = 20 // Add 20 seconds per correct answer

export default function RugbyAgainstTheClock() {
  const [question, setQuestion] = useState<{ question_text: string; answers: string[] } | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [answersFound, setAnswersFound] = useState<boolean[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerId = useRef<NodeJS.Timeout | null>(null)
  const [showRules, setShowRules] = useState(false)

  // Load today's question
  useEffect(() => {
    const loadTodaysQuestion = async () => {
      setLoading(true)
      setError(null)
      try {
        const today = getCurrentGMTDateString()
        console.log("Loading question for date:", today)

        // Try to get question from database
        const dbQuestion = await getRugbyClockQuestionByDate(today)

        if (dbQuestion) {
          console.log("Found question in database:", dbQuestion)
          setQuestion({
            question_text: dbQuestion.question_text,
            answers: dbQuestion.answers,
          })
          setAnswersFound(new Array(dbQuestion.answers.length).fill(false))
        } else {
          // Fallback to default question
          console.log("No question found for today, using default")
          setQuestion(DEFAULT_QUESTION)
          setAnswersFound(new Array(DEFAULT_QUESTION.answers.length).fill(false))
        }
      } catch (err) {
        console.error("Error loading question:", err)
        setError("Failed to load today's question. Please try again later.")
        // Fallback to default question
        setQuestion(DEFAULT_QUESTION)
        setAnswersFound(new Array(DEFAULT_QUESTION.answers.length).fill(false))
      } finally {
        setLoading(false)
      }
    }

    loadTodaysQuestion()
  }, [])

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeRemaining > 0) {
      timerId.current = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      setGameOver(true)
      setGameStarted(false)
      if (timerId.current) {
        clearInterval(timerId.current)
      }
    }

    return () => {
      if (timerId.current) {
        clearInterval(timerId.current)
      }
    }
  }, [gameStarted, timeRemaining])



  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setTimeRemaining(INITIAL_TIME)
    setUserAnswer("")
    if (question) {
      setAnswersFound(new Array(question.answers.length).fill(false))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userAnswer.trim() || !question || gameOver || !gameStarted) return

    const matchedAnswer = findBestMatch(userAnswer, question.answers)
    setUserAnswer("")

    if (matchedAnswer) {
      const answerIndex = question.answers.findIndex((a) => a.toLowerCase() === matchedAnswer.toLowerCase())

      if (answerIndex !== -1 && !answersFound[answerIndex]) {
        const newAnswersFound = [...answersFound]
        newAnswersFound[answerIndex] = true
        setAnswersFound(newAnswersFound)
        setScore((prev) => prev + 1)
        setTimeRemaining((prev) => prev + TIME_BONUS)

        // End game when ALL answers found
        if (newAnswersFound.every((found) => found)) {
          setGameOver(true)
          setGameStarted(false)
          if (timerId.current) clearInterval(timerId.current)
        }
      }
    }
  }

  const today = formatDisplayDate(getCurrentGMTDateString())

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 pb-8">
      <header className="p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/rugby">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-white text-xl font-bold">Rugby Against The Clock</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setShowRules(!showRules)}
              >
                <Info className="w-6 h-6" />
              </Button>
              <Link href="/game/against-the-clock/admin">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Settings className="w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {showRules && (
            <Card className="mb-6 border-2 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>Against The Clock</strong> tests your knowledge against the timer!
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You start with {INITIAL_TIME} seconds on the clock</li>
                  <li>Each correct answer adds {TIME_BONUS} seconds to your timer</li>
                  <li>Type your answer and press Enter or click Submit</li>
                  <li>Try to find all the answers before time runs out!</li>
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-white/20 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-center">
                <span className="block text-sm font-normal text-white/70">{today}</span>
                Daily Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mx-auto mb-4"></div>
                  <p>Loading today's challenge...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
                  <p className="text-red-400">{error}</p>
                  <Button onClick={() => window.location.reload()} variant="outline" className="border-white/20">
                    Try Again
                  </Button>
                </div>
              ) : !question ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-yellow-400" />
                  <p className="text-yellow-400">No challenge available for today.</p>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-white/70">Check back tomorrow for a new challenge!</p>
                    <Link href="/game/against-the-clock/admin">
                      <Button variant="outline" className="border-white/20 text-sm">
                        Admin: Add Today's Question
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {!gameStarted && !gameOver ? (
                    <div className="text-center py-8 space-y-6">
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold">{question.question_text}</h2>
                        <p className="text-white/70">Find all {question.answers.length} answers!</p>
                        <p className="text-white/70">Each correct answer adds {TIME_BONUS} seconds to your timer.</p>
                      </div>
                      <Button
                        onClick={startGame}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none"
                      >
                        Start Challenge
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-white/70" />
                            <span className="font-mono text-lg">{timeRemaining}s</span>
                          </div>
                          <div className="flex items-center">
                            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                            <span className="font-mono text-lg">
                              {score}/{question.answers.length}
                            </span>
                          </div>
                        </div>
                        <Progress value={(timeRemaining / (INITIAL_TIME + score * TIME_BONUS)) * 100} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-lg font-bold">{question.question_text}</h2>
                        {gameStarted && (
                          <form onSubmit={handleSubmit} className="space-y-2">
                            <AnswerAutocomplete
                              sport="rugby"
                              value={userAnswer}
                              onChange={setUserAnswer}
                              onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                              allowedAnswers={question?.answers}
                              placeholder="Start typing to search answers..."
                              disabled={!gameStarted || gameOver}
                            />
                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none"
                            >
                              Submit Answer
                            </Button>
                          </form>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {question.answers.map((_, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-md text-center ${
                              answersFound[index]
                                ? "bg-green-600/20 text-white"
                                : gameOver
                                  ? "bg-red-600/20 text-white"
                                  : "bg-white/10 text-white/30"
                            }`}
                          >
                            {answersFound[index] || gameOver ? question.answers[index] : "?????"}
                          </div>
                        ))}
                      </div>

                      {gameOver && (
                        <div className="space-y-4 pt-4 border-t border-white/20">
                          <div className="text-center">
                            <h3 className="text-xl font-bold">
                              {score === question.answers.length
                                ? "Perfect Score! 🎉"
                                : score > 0
                                  ? "Time's Up! ⏱️"
                                  : "Better Luck Next Time! 🍀"}
                            </h3>
                            <p className="text-white/70">
                              You got {score} out of {question.answers.length} answers
                            </p>
                          </div>
                          <Button
                            onClick={startGame}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none"
                          >
                            Play Again
                          </Button>
                          <div className="flex justify-center">
                            <Link href="/rugby">
                              <Button variant="outline" className="border-white/20">
                                Back to Rugby Games
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Admin button at the bottom */}
          <div className="mt-6 text-center">
            <Link href="/game/against-the-clock/admin">
              
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
