"use client"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { Settings, Share2, Trophy, Calendar, BarChart3, CalendarDays, Loader2 } from "lucide-react"
import { Confetti } from "@/components/confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavigationMenu } from "@/components/navigation-menu"
import { getCurrentGMTDateString, formatDisplayDate, parseDateStringToGMT } from "@/lib/date-utils"
import { getGAATenaBallQuestionByDate, type GAATenaBallQuestion } from "./actions"
import { findBestMatch } from "@/lib/answer-utils"
import { AnswerAutocomplete } from "@/components/answer-autocomplete"

interface DailyTenableProgress {
  date: string // GMT Date YYYY-MM-DD
  completed: boolean
  score: number
  strikes: number
  foundAnswersList: string[]
  timeToComplete?: number
}

interface OverallTenableStats {
  gamesPlayed: number
  totalCorrectAnswers: number
  totalPerfectGames: number
  averageScore: number
  bestDailyScore: number
  currentPerfectGameStreak: number
  longestPerfectGameStreak: number
  lastPlayedDate: string // GMT Date YYYY-MM-DD of the last game played
  completedDates: Record<string, boolean> // Store YYYY-MM-DD: true
}

const INITIAL_OVERALL_TENABLE_STATS = {
  gamesPlayed: 0,
  totalCorrectAnswers: 0,
  totalPerfectGames: 0,
  averageScore: 0,
  bestDailyScore: 0,
  currentPerfectGameStreak: 0,
  longestPerfectGameStreak: 0,
  lastPlayedDate: "",
  completedDates: {},
}

const DAILY_PROGRESS_LOCALSTORAGE_KEY = "gaa-tenable-daily-progress-gmt"
const OVERALL_STATS_LOCALSTORAGE_KEY = "gaa-tenable-overall-stats-gmt"
const MAX_STRIKES = 3

export default function GAATenablePage() {
  const [currentView, setCurrentView] = useState<"game" | "daily-stats" | "full-stats">("game")
  const [foundAnswers, setFoundAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [gameComplete, setGameComplete] = useState(false)
  const [showRevealPopup, setShowRevealPopup] = useState(false)
  const [strikes, setStrikes] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStartTime, setGameStartTime] = useState<number | null>(null)

  const [dailyProgress, setDailyProgress] = useState<DailyTenableProgress[]>([])
  const [overallStats, setOverallStats] = useState(INITIAL_OVERALL_TENABLE_STATS)
  const [isConfettiActive, setIsConfettiActive] = useState(false)
  const [hasPlayedToday, setHasPlayedToday] = useState(false)

  const [currentGMTDate, setCurrentGMTDate] = useState("")
  const [todaysQuestion, setTodaysQuestion] = useState<GAATenaBallQuestion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const updateDateAndLoadData = () => {
      const newGmtDateStr = getCurrentGMTDateString()

      if (newGmtDateStr !== currentGMTDate) {
        setCurrentGMTDate(newGmtDateStr)
        loadGameData(newGmtDateStr)
      }
    }

    updateDateAndLoadData() // Initial load
    const intervalId = setInterval(updateDateAndLoadData, 30 * 1000) // Check every 30 seconds

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateDateAndLoadData()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [currentGMTDate])

  const loadGameData = async (gmtDate: string) => {
    startTransition(() => {
      setIsLoading(true)
      setQuestionError(null)
    })

    try {
      const question = await getGAATenaBallQuestionByDate(gmtDate)
      console.log("[v0] GAA Tenable - Loaded question for", gmtDate, ":", question)
      setTodaysQuestion(question)

      if (!question) {
        setQuestionError(`No question available for ${formatDisplayDate(gmtDate)}. Please add one in the admin panel.`)
      }

      const savedDailyProgress = localStorage.getItem(DAILY_PROGRESS_LOCALSTORAGE_KEY)
      const progress: DailyTenableProgress[] = savedDailyProgress ? JSON.parse(savedDailyProgress) : []
      setDailyProgress(progress)

      const savedOverallStats = localStorage.getItem(OVERALL_STATS_LOCALSTORAGE_KEY)
      setOverallStats(savedOverallStats ? JSON.parse(savedOverallStats) : INITIAL_OVERALL_TENABLE_STATS)

      if (question) {
        const playedTodayEntry = progress.find((p) => p.date === gmtDate)

        if (playedTodayEntry?.completed) {
          setHasPlayedToday(true)
          setFoundAnswers(playedTodayEntry.foundAnswersList)
          setScore(playedTodayEntry.score)
          setStrikes(playedTodayEntry.strikes)
          setGameComplete(true)
        } else {
          resetGameForNewDay()
        }
      } else {
        resetGameForNewDay()
      }
    } catch (error) {
      console.error("Error loading game data:", error)
      setQuestionError("Error loading today's question. Please try again later.")
    } finally {
      startTransition(() => {
        setIsLoading(false)
      })
    }
  }

  useEffect(() => {
    if (!isLoading && (overallStats.gamesPlayed > 0 || dailyProgress.length > 0)) {
      localStorage.setItem(DAILY_PROGRESS_LOCALSTORAGE_KEY, JSON.stringify(dailyProgress))
    }
  }, [dailyProgress, isLoading, overallStats.gamesPlayed])

  useEffect(() => {
    if (!isLoading && (overallStats.gamesPlayed > 0 || dailyProgress.length > 0)) {
      localStorage.setItem(OVERALL_STATS_LOCALSTORAGE_KEY, JSON.stringify(overallStats))
    }
  }, [overallStats, isLoading, dailyProgress.length])

  const resetGameForNewDay = () => {
    setFoundAnswers([])
    setCurrentAnswer("")
    setGameComplete(false)
    setStrikes(0)
    setScore(0)
    setHasPlayedToday(false)
    setShowRevealPopup(false)
    setGameStartTime(null)
  }

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim() || !todaysQuestion || gameComplete || hasPlayedToday || isLoading) return
    if (!gameStartTime) setGameStartTime(Date.now())

    const matchedAnswer = findBestMatch(
      currentAnswer,
      todaysQuestion.answers.filter(
        (answer) => !foundAnswers.some((found) => found.toLowerCase().trim() === answer.toLowerCase().trim()),
      ),
    )

    if (matchedAnswer) {
      const newFoundAnswers = [...foundAnswers, matchedAnswer]
      setFoundAnswers(newFoundAnswers)
      setScore((prevScore) => prevScore + 1)
      if (newFoundAnswers.length >= todaysQuestion.answers.length) {
        finalizeGame(strikes, newFoundAnswers, score + 1)
      }
    } else {
      const isAlreadyFound = foundAnswers.some((found) => findBestMatch(currentAnswer, [found]) !== null)

      if (!isAlreadyFound) {
        const newStrikes = strikes + 1
        setStrikes(newStrikes)
        if (newStrikes >= MAX_STRIKES) {
          finalizeGame(newStrikes, foundAnswers, score)
        }
      }
    }
    setCurrentAnswer("")
  }

  const finalizeGame = (finalStrikes: number, finalFoundAnswers: string[], finalScore: number) => {
    if (gameComplete || hasPlayedToday || !todaysQuestion) return

    setGameComplete(true)
    setHasPlayedToday(true)

    const endTime = Date.now()
    const timeToComplete = gameStartTime ? Math.floor((endTime - gameStartTime) / 1000) : 0

    const newDailyEntry: DailyTenableProgress = {
      date: currentGMTDate,
      completed: true,
      score: finalScore,
      strikes: finalStrikes,
      foundAnswersList: finalFoundAnswers,
      timeToComplete,
    }

    setDailyProgress((prev) => {
      const existingEntryIndex = prev.findIndex((p) => p.date === currentGMTDate)
      if (existingEntryIndex > -1) {
        const updatedProgress = [...prev]
        updatedProgress[existingEntryIndex] = newDailyEntry
        return updatedProgress
      }
      return [...prev, newDailyEntry]
    })

    const isPerfectGame = finalScore === 10 && finalStrikes === 0
    setOverallStats((prev) => {
      const oldProgressForThisDate = prev.completedDates[currentGMTDate]
        ? dailyProgress.find((p) => p.date === currentGMTDate && p.completed)
        : null

      let newGamesPlayed = prev.gamesPlayed
      let newTotalCorrect = prev.totalCorrectAnswers
      let newPerfectGames = prev.totalPerfectGames

      if (oldProgressForThisDate) {
        newTotalCorrect = prev.totalCorrectAnswers - oldProgressForThisDate.score + finalScore
        if (oldProgressForThisDate.score === 10 && oldProgressForThisDate.strikes === 0 && !isPerfectGame) {
          newPerfectGames = Math.max(0, prev.totalPerfectGames - 1)
        } else if (!(oldProgressForThisDate.score === 10 && oldProgressForThisDate.strikes === 0) && isPerfectGame) {
          newPerfectGames = prev.totalPerfectGames + 1
        }
      } else {
        newGamesPlayed = prev.gamesPlayed + 1
        newTotalCorrect = prev.totalCorrectAnswers + finalScore
        if (isPerfectGame) newPerfectGames = prev.totalPerfectGames + 1
      }

      let currentStreak = prev.currentPerfectGameStreak
      let longestStreak = prev.longestPerfectGameStreak

      if (isPerfectGame) {
        const todayGmtObj = parseDateStringToGMT(currentGMTDate)
        const lastPlayedGmtObj = prev.lastPlayedDate ? parseDateStringToGMT(prev.lastPlayedDate) : null
        let isConsecutive = false
        if (lastPlayedGmtObj) {
          const expectedYesterday = new Date(todayGmtObj)
          expectedYesterday.setUTCDate(todayGmtObj.getUTCDate() - 1)
          if (lastPlayedGmtObj.getTime() === expectedYesterday.getTime()) {
            isConsecutive = true
          }
        }
        if (prev.lastPlayedDate === currentGMTDate) {
          currentStreak = prev.currentPerfectGameStreak > 0 ? prev.currentPerfectGameStreak : 1
        } else if (isConsecutive) {
          currentStreak = prev.currentPerfectGameStreak + 1
        } else {
          currentStreak = 1
        }
      } else {
        if (prev.lastPlayedDate !== currentGMTDate) {
          currentStreak = 0
        } else if (oldProgressForThisDate) {
          currentStreak = 0
        }
      }
      longestStreak = Math.max(prev.longestPerfectGameStreak, currentStreak)

      return {
        ...prev,
        gamesPlayed: newGamesPlayed,
        totalCorrectAnswers: newTotalCorrect,
        totalPerfectGames: newPerfectGames,
        averageScore: newGamesPlayed > 0 ? Number.parseFloat((newTotalCorrect / newGamesPlayed).toFixed(2)) : 0,
        bestDailyScore: Math.max(prev.bestDailyScore, finalScore),
        currentPerfectGameStreak: currentStreak,
        longestPerfectGameStreak: longestStreak,
        lastPlayedDate: currentGMTDate,
        completedDates: { ...prev.completedDates, [currentGMTDate]: true },
      }
    })

    if (finalScore === 10 && finalStrikes === 0) {
      setIsConfettiActive(true)
      setTimeout(() => setIsConfettiActive(false), 5000)
    } else if (finalScore > 7) {
      setIsConfettiActive(true)
      setTimeout(() => setIsConfettiActive(false), 3000)
    }

    if (finalStrikes >= MAX_STRIKES || (finalFoundAnswers.length < 10 && finalStrikes < MAX_STRIKES)) {
      setShowRevealPopup(true)
    }
  }

  const handleRevealPopupContinue = () => {
    setShowRevealPopup(false)
  }

  const TenableLadder = () => (
    <div className="flex flex-col items-center">
      <div className="text-white font-bold text-lg mb-4">TENABLE LADDER</div>
      <div className="relative">
        <div className="flex flex-col-reverse gap-1">
          {Array.from({ length: 10 }, (_, index) => {
            const level = index + 1
            const isFound = score >= level
            const isActive = score === level - 1 && !gameComplete && strikes < MAX_STRIKES && !hasPlayedToday

            return (
              <div
                key={level}
                className={`relative w-48 h-10 sm:w-56 sm:h-12 border-2 rounded-lg transition-all duration-300 flex items-center justify-center ${
                  isFound
                    ? "bg-gradient-to-r from-green-500 to-green-600 border-green-400 shadow-lg shadow-green-500/50"
                    : isActive
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 shadow-lg shadow-amber-500/50 animate-pulse"
                      : "bg-slate-700 border-slate-600"
                }`}
              >
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                      isFound
                        ? "bg-white text-green-600"
                        : isActive
                          ? "bg-white text-amber-600"
                          : "bg-slate-600 text-slate-400"
                    }`}
                  >
                    {level}
                  </div>
                </div>
                <div
                  className={`font-semibold text-center text-xs sm:text-sm ${isFound || isActive ? "text-white" : "text-slate-400"}`}
                >
                  {isFound ? "✓ FOUND" : isActive ? "NEXT TARGET" : "LOCKED"}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-center mt-4">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
              score >= 10
                ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-500/50 animate-bounce"
                : "bg-slate-700 border-2 border-slate-600"
            }`}
          >
            <Trophy className={`w-7 h-7 sm:w-8 sm:h-8 ${score >= 10 ? "text-white" : "text-slate-400"}`} />
          </div>
        </div>
      </div>
    </div>
  )

  const RevealPopup = () => {
    if (!todaysQuestion) return null
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white mb-2">
              {strikes >= MAX_STRIKES ? "Game Over - Max Strikes!" : "Answers Revealed"}
            </CardTitle>
            <p className="text-slate-400">You found {score} out of 10 answers.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-lg">Complete Answer List:</h4>
              {todaysQuestion.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 ${
                    foundAnswers.includes(answer) ? "bg-green-900/50 border-green-500" : "bg-red-900/50 border-red-500"
                  }`}
                >
                  <span className={`font-medium ${foundAnswers.includes(answer) ? "text-green-300" : "text-red-300"}`}>
                    {index + 1}. {answer}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button
                onClick={handleRevealPopupContinue}
                className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-3"
              >
                Continue to Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const DailyStatsView = () => {
    const last7DaysProgress = dailyProgress
      .filter((p) => p.completed)
      .sort((a, b) => parseDateStringToGMT(b.date).getTime() - parseDateStringToGMT(a.date).getTime())
      .slice(0, 7)
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-white">
        <Card className="bg-slate-800/70 border-slate-700">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Daily Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-green-400">{formatDisplayDate(currentGMTDate)}</div>
              <div className="text-sm text-slate-400">Today</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">{overallStats.currentPerfectGameStreak}</div>
              <div className="text-sm text-slate-400">Perfect Game Streak</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">{Object.keys(overallStats.completedDates).length}</div>
              <div className="text-sm text-slate-400">Unique Days Played</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/70 border-slate-700">
          <CardHeader>
            <CardTitle>Last 7 Played Days</CardTitle>
          </CardHeader>
          <CardContent>
            {last7DaysProgress.length === 0 ? (
              <p className="text-slate-400 text-center">No games played recently.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                    <tr>
                      <th scope="col" className="px-4 py-2">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Score
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Strikes
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {last7DaysProgress.map((p) => (
                      <tr key={p.date} className="border-b border-slate-700 hover:bg-slate-700/30">
                        <td className="px-4 py-2">{formatDisplayDate(p.date)}</td>
                        <td className="px-4 py-2">{p.score}/10</td>
                        <td className="px-4 py-2">{p.strikes}</td>
                        <td className="px-4 py-2">
                          {p.timeToComplete ? `${Math.floor(p.timeToComplete / 60)}m ${p.timeToComplete % 60}s` : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const FullStatsView = () => (
    <div className="max-w-3xl mx-auto space-y-6 text-white">
      <Card className="bg-slate-800/70 border-slate-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl">All-Time TenaBall Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">{overallStats.gamesPlayed}</div>
            <div className="text-xs text-slate-400">Games Played</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{overallStats.averageScore.toFixed(1)}/10</div>
            <div className="text-xs text-slate-400">Avg. Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{overallStats.totalPerfectGames}</div>
            <div className="text-xs text-slate-400">Perfect Games</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{overallStats.bestDailyScore}/10</div>
            <div className="text-xs text-slate-400">Best Daily Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{overallStats.currentPerfectGameStreak}</div>
            <div className="text-xs text-slate-400">Current Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{overallStats.longestPerfectGameStreak}</div>
            <div className="text-xs text-slate-400">Longest Streak</div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/70 border-slate-700">
        <CardHeader>
          <CardTitle>Recent Days Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const day = new Date()
              day.setUTCDate(day.getUTCDate() - 29 + i)
              const dateString = day.toISOString().split("T")[0]
              const isCompleted = overallStats.completedDates[dateString]
              const isCurrent = getCurrentGMTDateString() === dateString

              return (
                <div
                  key={dateString}
                  title={formatDisplayDate(dateString)}
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all
                ${isCompleted ? "bg-green-600 border-green-400 text-white" : ""}
                ${isCurrent && !isCompleted ? "bg-amber-500 border-amber-300 text-white animate-pulse" : ""}
                ${!isCompleted && !isCurrent ? "bg-slate-700 border-slate-600 text-slate-400" : ""}`}
                >
                  {day.getUTCDate()}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-amber-400 mr-3" />
        Loading Game...
      </div>
    )
  }

  if (!todaysQuestion && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md w-full">
          <CardContent className="p-8 text-center text-white">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Question Available</h2>
            <p className="text-slate-400 mb-6">
              {questionError || `There's no question set for today (${formatDisplayDate(currentGMTDate)}).`}
            </p>
            <Link href="/gaa/tenable/admin">
              <Button className="bg-amber-400 hover:bg-amber-500 text-black font-bold">
                <Settings className="w-4 h-4 mr-2" /> Add Today's Question
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white">
      <Confetti
        active={isConfettiActive}
        settings={{
          particleCount: score === 10 && strikes === 0 ? 200 : 100,
          spread: score === 10 && strikes === 0 ? 90 : 70,
          startVelocity: score === 10 && strikes === 0 ? 40 : 30,
          colors: ["#A7F3D0", "#34D399", "#059669", "#FBBF24", "#F59E0B"],
        }}
      />
      {showRevealPopup && <RevealPopup />}

      <header className="p-4 border-b border-green-700/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <NavigationMenu currentSection="gaa" />
            <div className="text-center">
              <div className="text-amber-400 font-semibold text-sm">GAA TenaBall</div>
              <h1 className="font-bold text-lg">
                {currentGMTDate ? formatDisplayDate(currentGMTDate) : "Today's Challenge"}
              </h1>
            </div>
            <Link href="/gaa/tenable/admin">
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Settings className="w-6 h-6" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center gap-2 mb-6">
          <Button
            onClick={() => setCurrentView("game")}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${currentView === "game" ? "bg-amber-400 text-black" : "bg-slate-700 text-slate-300 hover:bg-amber-500/80 hover:text-black"}`}
          >
            Today's Game
          </Button>
          <Button
            onClick={() => setCurrentView("daily-stats")}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${currentView === "daily-stats" ? "bg-amber-400 text-black" : "bg-slate-700 text-slate-300 hover:bg-amber-500/80 hover:text-black"}`}
          >
            <CalendarDays className="w-4 h-4 mr-1.5" /> Daily Stats
          </Button>
          <Button
            onClick={() => setCurrentView("full-stats")}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${currentView === "full-stats" ? "bg-amber-400 text-black" : "bg-slate-700 text-slate-300 hover:bg-amber-500/80 hover:text-black"}`}
          >
            <BarChart3 className="w-4 h-4 mr-1.5" /> Full Stats
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-8">
        {currentView === "game" && todaysQuestion && (
          <div className="space-y-6">
            {hasPlayedToday && !showRevealPopup && (
              <Card className="bg-green-900/50 border-green-700">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <div className="text-green-300 font-bold text-xl">Today's challenge completed!</div>
                  <div className="text-slate-300 text-lg">
                    Your Score: {score}/10 with {strikes} strikes.
                  </div>
                  <p className="text-slate-400 text-sm mt-2">
                    Come back tomorrow for a new challenge or check your stats.
                  </p>
                </CardContent>
              </Card>
            )}

            {!hasPlayedToday && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">{todaysQuestion.question_text}</h3>
                    <p className="text-slate-400 text-sm sm:text-base mb-4">
                      Name 10 answers. {MAX_STRIKES} strikes and you're out!
                    </p>
                    <div className="flex justify-center gap-6 sm:gap-8 text-sm sm:text-base">
                      <div className="text-green-400">Found: {score}/10</div>
                      <div className="text-red-400">
                        Strikes: {strikes}/{MAX_STRIKES}
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex gap-2">
                        <AnswerAutocomplete
                          sport="gaa"
                          value={currentAnswer}
                          onChange={setCurrentAnswer}
                          onSubmit={handleSubmitAnswer}
                          disabled={gameComplete || hasPlayedToday || isLoading}
                          placeholder="Start typing to search answers..."
                          allowedAnswers={todaysQuestion?.answers}
                        />
                        <Button
                          onClick={handleSubmitAnswer}
                          className="bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm sm:text-base"
                          disabled={gameComplete || hasPlayedToday || isLoading || !currentAnswer.trim()}
                        >
                          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Submit
                        </Button>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <h4 className="font-semibold mb-2 text-sm sm:text-base text-white">Answers Found:</h4>
                        {Array.from({ length: 10 }).map((_, index) => (
                          <div
                            key={index}
                            className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
                              foundAnswers[index]
                                ? "bg-green-900/50 border-green-500 text-green-300"
                                : gameComplete || hasPlayedToday
                                  ? "bg-slate-700/50 border-slate-600 text-slate-400"
                                  : "bg-slate-800/50 border-slate-700 text-slate-500"
                            }`}
                          >
                            {foundAnswers[index]
                              ? `${index + 1}. ${foundAnswers[index]}`
                              : gameComplete || hasPlayedToday
                                ? `${index + 1}. ${todaysQuestion?.answers[index] || "???"}`
                                : `${index + 1}. ???`}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center lg:pt-10">
                      <TenableLadder />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(gameComplete || hasPlayedToday) && !showRevealPopup && (
              <Card className="bg-slate-800/50 border-slate-700 mt-6">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white">
                    Challenge for {currentGMTDate ? formatDisplayDate(currentGMTDate) : ""} Complete!
                  </h3>
                  <p className="text-slate-300 mb-3 sm:mb-4 text-sm sm:text-base">
                    You found {score} answers with {strikes} strikes.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button
                      className="bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm sm:text-base"
                      onClick={() => {
                        const shareText = `I scored ${score}/10 on GAA TenaBall (${currentGMTDate ? formatDisplayDate(currentGMTDate) : ""}) on GAAmesquiz.com! ${strikes} strikes. #GAATenaBall #GAAmesquiz`
                        const shareUrl = window.location.href
                        if (navigator.share) {
                          navigator
                            .share({ title: "My GAA TenaBall Score!", text: shareText, url: shareUrl })
                            .catch(console.error)
                        } else {
                          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
                          window.open(twitterUrl, "_blank")
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Share Score
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-sm sm:text-base bg-transparent"
                      onClick={() => setCurrentView("daily-stats")}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" /> View Stats
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {currentView === "daily-stats" && <DailyStatsView />}
        {currentView === "full-stats" && <FullStatsView />}
      </main>
    </div>
  )
}
