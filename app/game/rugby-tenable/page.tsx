"use client"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { Settings, Share2, Trophy, Calendar, BarChart3, Loader2 } from "lucide-react"
import { Confetti } from "@/components/confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavigationMenu } from "@/components/navigation-menu"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { RugbyTenaBallQuestion, GameStats, DailyGameProgress } from "./types"
import { getCurrentGMTDateString, formatDisplayDate, parseDateStringToGMT } from "@/lib/date-utils"
import { RevealPopup } from "@/components/reveal-popup"
import { findBestMatch } from "@/lib/answer-utils"
import { AnswerAutocomplete } from "@/components/answer-autocomplete"

const DAILY_PROGRESS_LOCALSTORAGE_KEY = "rugbyTenaBallDailyProgress_v2_dateBased"
const GAME_STATS_LOCALSTORAGE_KEY = "rugbyTenaBallGameStats_v2_dateBased"
const MAX_STRIKES = 3

export default function RugbyTenablePage() {
  const [currentView, setCurrentView] = useState<"game" | "daily-stats" | "full-stats">("game")
  const [todaysQuestion, setTodaysQuestion] = useState<RugbyTenaBallQuestion | null>(null)
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true)
  const [questionError, setQuestionError] = useState<string | null>(null)

  const [foundAnswers, setFoundAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [gameComplete, setGameComplete] = useState(false)
  const [strikes, setStrikes] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStartTime, setGameStartTime] = useState<number | null>(null)

  const [gameStats, setGameStats] = useState<GameStats>({
    questionsCompleted: 0,
    totalCorrectAnswers: 0,
    totalStrikes: 0,
    averageScore: 0,
    bestScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    gamesPlayed: 0,
    perfectGames: 0,
    lastPlayedDate: "",
  })
  const [dailyProgress, setDailyProgress] = useState<DailyGameProgress[]>([])
  const [isConfettiActive, setIsConfettiActive] = useState(false)
  const [currentGMTDate, setCurrentGMTDate] = useState("")

  const [showRevealPopup, setShowRevealPopup] = useState(false)

  const supabase = createSupabaseBrowserClient()
  const [isPending, startTransition] = useTransition()

  // Effect to initialize and periodically update currentGMTDate
  useEffect(() => {
    const updateDate = () => {
      const newGmtDateStr = getCurrentGMTDateString()
      if (newGmtDateStr !== currentGMTDate) {
        setCurrentGMTDate(newGmtDateStr)
      }
    }
    updateDate() // Initial update
    const intervalId = setInterval(updateDate, 30 * 1000) // Check every 30 seconds
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateDate()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [currentGMTDate]) // Rerun if currentGMTDate changes from an external source (though unlikely here)

  // Effect to fetch question when currentGMTDate changes
  useEffect(() => {
    if (!currentGMTDate || !supabase) return

    async function fetchTodaysQuestion(dateStr: string) {
      startTransition(() => {
        setIsLoadingQuestion(true)
        setQuestionError(null)
        setTodaysQuestion(null) // Clear previous question
      })

      const { data, error } = await supabase
        .from("rugby_tenaball_questions")
        .select("*")
        .eq("question_date", dateStr)
        .maybeSingle()

      startTransition(() => {
        if (error) {
          setQuestionError(`Failed to load question for ${formatDisplayDate(dateStr)}. ${error.message}`)
          setTodaysQuestion(null)
        } else if (!data) {
          setQuestionError(
            `No question available for ${formatDisplayDate(
              dateStr,
            )}. Please add one in the admin panel or check back later.`,
          )
          setTodaysQuestion(null)
        } else {
          setTodaysQuestion(data as RugbyTenaBallQuestion)
          setQuestionError(null)
        }
        setIsLoadingQuestion(false)
      })
    }

    fetchTodaysQuestion(currentGMTDate)
  }, [currentGMTDate, supabase])

  // Effect to load stats from localStorage (runs once)
  useEffect(() => {
    const savedGameStats = localStorage.getItem(GAME_STATS_LOCALSTORAGE_KEY)
    if (savedGameStats) setGameStats(JSON.parse(savedGameStats))

    const savedDailyProgress = localStorage.getItem(DAILY_PROGRESS_LOCALSTORAGE_KEY)
    if (savedDailyProgress) {
      const progress: DailyGameProgress[] = JSON.parse(savedDailyProgress)
      setDailyProgress(progress)
    }
  }, [])

  // Effect to handle game state based on todaysQuestion and dailyProgress
  useEffect(() => {
    if (todaysQuestion) {
      const todayProgress = dailyProgress.find((p) => p.date === todaysQuestion.question_date)
      if (todayProgress?.completed) {
        setGameComplete(true)
        setFoundAnswers(todayProgress.foundAnswers)
        setScore(todayProgress.score)
        setStrikes(todayProgress.strikes)
      } else {
        setFoundAnswers([])
        setCurrentAnswer("")
        setStrikes(0)
        setScore(0)
        setGameStartTime(null)
        setGameComplete(false)
      }
    } else {
      // If no question, reset game state
      setFoundAnswers([])
      setCurrentAnswer("")
      setStrikes(0)
      setScore(0)
      setGameStartTime(null)
      setGameComplete(false)
    }
  }, [todaysQuestion, dailyProgress])

  useEffect(() => {
    if (gameStats.gamesPlayed > 0 || dailyProgress.length > 0) {
      // Avoid writing initial empty state
      localStorage.setItem(GAME_STATS_LOCALSTORAGE_KEY, JSON.stringify(gameStats))
    }
  }, [gameStats])

  useEffect(() => {
    if (gameStats.gamesPlayed > 0 || dailyProgress.length > 0) {
      // Avoid writing initial empty state
      localStorage.setItem(DAILY_PROGRESS_LOCALSTORAGE_KEY, JSON.stringify(dailyProgress))
    }
  }, [dailyProgress])

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim() || !todaysQuestion || gameComplete || isPending) return
    if (!gameStartTime) setGameStartTime(Date.now())

    const matchedAnswer = findBestMatch(
      currentAnswer,
      todaysQuestion.answers.filter(
        (ans) => !foundAnswers.some((fa) => fa.toLowerCase().trim() === ans.toLowerCase().trim()),
      ),
    )

    if (matchedAnswer) {
      const newFoundAnswers = [...foundAnswers, matchedAnswer]
      setFoundAnswers(newFoundAnswers)
      setScore((prevScore) => prevScore + 1)
      if (newFoundAnswers.length >= todaysQuestion.answers.length) {
        finalizeGameCompletion(newFoundAnswers, score + 1, strikes)
      }
    } else {
      // Check if answer is already found
      const isAlreadyFound = foundAnswers.some((found) => findBestMatch(currentAnswer, [found]) !== null)

      if (!isAlreadyFound) {
        // Only strike if not already found and not correct
        const newStrikes = strikes + 1
        setStrikes(newStrikes)
        if (newStrikes >= MAX_STRIKES) {
          finalizeGameCompletion(foundAnswers, score, newStrikes)
        }
      }
    }
    setCurrentAnswer("")
  }

  const finalizeGameCompletion = (finalFoundAnswers: string[], finalScore: number, finalStrikes: number) => {
    if (!todaysQuestion || gameComplete) return // Ensure gameComplete check is effective
    setGameComplete(true) // Set immediately to prevent re-entry

    const endTime = Date.now()
    const timeToComplete = gameStartTime ? Math.floor((endTime - gameStartTime) / 1000) : 0

    const newDailyEntry: DailyGameProgress = {
      date: todaysQuestion.question_date,
      completed: true,
      score: finalScore,
      strikes: finalStrikes,
      timeToComplete,
      foundAnswers: finalFoundAnswers,
    }

    setDailyProgress((prev) => {
      const existingEntryIndex = prev.findIndex((p) => p.date === todaysQuestion.question_date)
      if (existingEntryIndex > -1) {
        const updatedProgress = [...prev]
        updatedProgress[existingEntryIndex] = newDailyEntry
        return updatedProgress
      }
      return [...prev, newDailyEntry]
    })

    // Score and strikes are already set by handleSubmitAnswer or directly before calling this
    // setScore(finalScore); // Not needed if score state is managed correctly before this call
    // setStrikes(finalStrikes); // Not needed
    setFoundAnswers(finalFoundAnswers) // Ensure found answers are up to date

    const totalAnswers = todaysQuestion.answers.length
    const isPerfectGame = finalStrikes === 0 && finalFoundAnswers.length === totalAnswers
    setGameStats((prev) => {
      const todayDate = todaysQuestion.question_date // Date of the current question
      const playedThisDateBefore = prev.lastPlayedDate === todayDate // Check if the last game played was for this specific date

      let newGamesPlayed = prev.gamesPlayed
      let newTotalCorrect = prev.totalCorrectAnswers
      let newTotalStrikes = prev.totalStrikes
      let newPerfectGames = prev.perfectGames
      let currentStreak = prev.currentStreak
      let longestStreak = prev.longestStreak

      const oldProgressForThisDate = dailyProgress.find((p) => p.date === todayDate && p.completed)

      if (oldProgressForThisDate && oldProgressForThisDate.date === newDailyEntry.date) {
        // Replaying/overwriting same day's completed game
        newTotalCorrect = prev.totalCorrectAnswers - oldProgressForThisDate.score + finalScore
        newTotalStrikes = prev.totalStrikes - oldProgressForThisDate.strikes + finalStrikes
        if (oldProgressForThisDate.score === totalAnswers && oldProgressForThisDate.strikes === 0 && !isPerfectGame) {
          newPerfectGames = Math.max(0, prev.perfectGames - 1) // Lost a perfect game
        } else if (!(oldProgressForThisDate.score === totalAnswers && oldProgressForThisDate.strikes === 0) && isPerfectGame) {
          newPerfectGames = prev.perfectGames + 1 // Gained a perfect game
        }
        // gamesPlayed does not increment if overwriting same day's record
      } else {
        // First time playing this specific date or playing a new date
        newGamesPlayed = prev.gamesPlayed + 1
        newTotalCorrect = prev.totalCorrectAnswers + finalScore
        newTotalStrikes = prev.totalStrikes + finalStrikes
        if (isPerfectGame) newPerfectGames = prev.perfectGames + 1
      }

      // Streak logic: based on consecutive GMT days with perfect games
      if (isPerfectGame) {
        const todayGmt = parseDateStringToGMT(todayDate)
        const lastPlayedGmt = prev.lastPlayedDate ? parseDateStringToGMT(prev.lastPlayedDate) : null

        let isConsecutiveDay = false
        if (lastPlayedGmt) {
          const expectedYesterday = new Date(todayGmt)
          expectedYesterday.setUTCDate(todayGmt.getUTCDate() - 1)
          if (lastPlayedGmt.getTime() === expectedYesterday.getTime()) {
            isConsecutiveDay = true
          }
        }

        if (prev.lastPlayedDate === todayDate) {
          // Replayed same day, perfect game
          currentStreak = prev.currentStreak > 0 ? prev.currentStreak : 1 // Maintain if already on streak, or start at 1
        } else if (isConsecutiveDay) {
          // Perfect game on a consecutive day
          currentStreak = prev.currentStreak + 1
        } else {
          // Perfect game, but not consecutive or first game
          currentStreak = 1
        }
      } else {
        // Not a perfect game
        if (prev.lastPlayedDate !== todayDate) {
          // If it's a new day and not perfect, streak resets
          currentStreak = 0
        } // If same day and not perfect, streak would have been broken by previous logic or remains 0
        else if (playedThisDateBefore) {
          // If replaying same day and it's not perfect, streak resets
          currentStreak = 0
        }
      }
      longestStreak = Math.max(prev.longestStreak, currentStreak)

      return {
        ...prev,
        gamesPlayed: newGamesPlayed,
        totalCorrectAnswers: newTotalCorrect,
        totalStrikes: newTotalStrikes,
        averageScore: newGamesPlayed > 0 ? newTotalCorrect / newGamesPlayed : 0,
        bestScore: Math.max(prev.bestScore, finalScore),
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        perfectGames: newPerfectGames,
        lastPlayedDate: todayDate, // Store the date of the question played
      }
    })

    setIsConfettiActive(true)
    setTimeout(() => setIsConfettiActive(false), 5000)
  }

  const TenableLadder = () => {
    const totalAnswers = todaysQuestion?.answers.length ?? 10
    return (
      <div className="flex flex-col items-center">
        <div className="text-white font-bold text-lg mb-4">TENABLE LADDER</div>
        <div className="relative">
          <div className="flex flex-col-reverse gap-1">
            {Array.from({ length: totalAnswers }, (_, index) => {
              const level = index + 1
              const isFound = score >= level
              const isActive = score === level - 1 && !gameComplete && strikes < MAX_STRIKES
              return (
                <div
                  key={level}
                  className={`relative w-48 h-12 border-2 rounded-lg transition-all duration-500 ${isFound ? "bg-gradient-to-r from-green-500 to-green-600 border-green-400 shadow-lg shadow-green-500/50" : isActive ? "bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 shadow-lg shadow-yellow-500/50 animate-pulse" : "bg-slate-700 border-slate-600"}`}
                >
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isFound ? "bg-white text-green-600" : isActive ? "bg-white text-yellow-600" : "bg-slate-600 text-slate-400"}`}
                    >
                      {level}
                    </div>
                  </div>
                  <div className="flex items-center justify-center h-full pl-12 pr-4">
                    <div
                      className={`font-semibold text-center ${isFound ? "text-white" : isActive ? "text-white" : "text-slate-400"}`}
                    >
                      {isFound ? "✓ FOUND" : isActive ? "NEXT TARGET" : "LOCKED"}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center mt-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${score >= totalAnswers ? "bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/50 animate-bounce" : "bg-slate-700 border-2 border-slate-600"}`}
            >
              <Trophy className={`w-8 h-8 ${score >= totalAnswers ? "text-white" : "text-slate-400"}`} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const DailyStatsView = () => (
    <Card className="bg-slate-800/80 border-slate-700 text-white">
      <CardHeader>
        <CardTitle>Daily Stats (Last 7 Played Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {dailyProgress.length === 0 && <p>No daily games recorded yet.</p>}
        <div className="space-y-2">
          {dailyProgress
            .slice()
            .sort((a, b) => parseDateStringToGMT(b.date).getTime() - parseDateStringToGMT(a.date).getTime())
            .slice(0, 7)
            .map((p) => (
              <div key={p.date} className="p-2 bg-slate-700/50 rounded">
                {formatDisplayDate(p.date)}: {p.score}/10, {p.strikes} strikes. Time:{" "}
                {p.timeToComplete ? `${Math.floor(p.timeToComplete / 60)}m ${p.timeToComplete % 60}s` : "N/A"}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
  const FullStatsView = () => (
    <Card className="bg-slate-800/80 border-slate-700 text-white">
      <CardHeader>
        <CardTitle>Overall Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div>Games Played: {gameStats.gamesPlayed}</div>
        <div>Average Score: {gameStats.averageScore.toFixed(1)}/10</div>
        <div>Best Score: {gameStats.bestScore}/10</div>
        <div>Perfect Games (10/10, 0 strikes): {gameStats.perfectGames}</div>
        <div>Current Perfect Streak: {gameStats.currentStreak}</div>
        <div>Longest Perfect Streak: {gameStats.longestStreak}</div>
        <div>Total Correct Answers: {gameStats.totalCorrectAnswers}</div>
        <div>Total Strikes Given: {gameStats.totalStrikes}</div>
      </CardContent>
    </Card>
  )

  if (isLoadingQuestion && !todaysQuestion) {
    // Show loader only if truly loading and no question is set
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-12 h-12 animate-spin text-lime-400 mb-4" />
        <p className="text-xl">Loading Today's Challenge...</p>
      </div>
    )
  }

  if (questionError && !todaysQuestion) {
    // Show error only if no question could be loaded
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-white p-4">
        <Card className="bg-red-800/30 border-red-700 text-center">
          <CardHeader>
            <CardTitle className="text-red-300">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-red-200">{questionError}</p>
            <Link href="/game/rugby-tenable/admin">
              <Button className="bg-lime-500 hover:bg-lime-600 text-black">Go to Admin</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!todaysQuestion && !isLoadingQuestion) {
    // Handles case where loading finished but no question
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-white p-4">
        <Card className="bg-slate-800/80 border-slate-700 text-center">
          <CardHeader>
            <CardTitle>No Question Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              No question is set for {currentGMTDate ? formatDisplayDate(currentGMTDate) : "today"} in the admin panel.
            </p>
            <Link href="/game/rugby-tenable/admin">
              <Button className="bg-lime-500 hover:bg-lime-600 text-black">Go to Admin to Add Question</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Confetti
        active={isConfettiActive}
        settings={{ particleCount: score === (todaysQuestion?.answers.length ?? 10) && strikes === 0 ? 200 : 100, spread: 70 }}
      />
      <header className="p-4 border-b border-slate-700">
        <div className="container mx-auto flex items-center justify-between">
          <NavigationMenu currentSection="rugby" />
          <div className="text-center">
            <div className="text-lime-400 font-semibold text-sm">Rugby TenaBall</div>
            <h1 className="text-white font-bold text-lg">
              {currentGMTDate ? formatDisplayDate(currentGMTDate) : "Today's"} Challenge
            </h1>
          </div>
          <Link href="/game/rugby-tenable/admin">
            <Button variant="ghost" size="icon" className="hover:bg-slate-700">
              <Settings className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => setCurrentView("game")}
            className={`px-4 py-2 sm:px-6 rounded-full font-bold ${currentView === "game" ? "bg-lime-400 text-black" : "bg-transparent border-2 border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black"}`}
          >
            Today's Game
          </Button>
          <Button
            onClick={() => setCurrentView("daily-stats")}
            className={`px-4 py-2 sm:px-6 rounded-full font-bold ${currentView === "daily-stats" ? "bg-lime-400 text-black" : "bg-transparent border-2 border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black"}`}
          >
            <Calendar className="w-4 h-4 mr-1 sm:mr-2" />
            Daily Stats
          </Button>
          <Button
            onClick={() => setCurrentView("full-stats")}
            className={`px-4 py-2 sm:px-6 rounded-full font-bold ${currentView === "full-stats" ? "bg-lime-400 text-black" : "bg-transparent border-2 border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black"}`}
          >
            <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
            Full Stats
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-8">
        {currentView === "daily-stats" && <DailyStatsView />}
        {currentView === "full-stats" && <FullStatsView />}
        {currentView === "game" && todaysQuestion && (
          <div className="space-y-6">
            {gameComplete && (
              <Card className="bg-green-800/30 border-green-700 text-center">
                <CardContent className="p-4">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-green-300 font-bold">
                    Challenge for {formatDisplayDate(todaysQuestion.question_date)} completed!
                  </div>
                  <div className="text-slate-400 text-sm">
                    Score: {score}/10, Strikes: {strikes}
                  </div>
                  <div className="text-slate-400 text-sm">Come back tomorrow for a new challenge.</div>
                </CardContent>
              </Card>
            )}
            <Card className="bg-slate-800/80 border-slate-700">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-white">{todaysQuestion.question_text}</h3>
                  <p className="text-slate-400 mb-4">Name 10 answers. You have {MAX_STRIKES} strikes.</p>
                  <div className="flex justify-center gap-8 text-sm">
                    <div className="text-green-400">Found: {score}/10</div>
                    <div className="text-red-400">
                      Strikes: {strikes}/{MAX_STRIKES}
                    </div>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                {!gameComplete && (
                  <div className="flex gap-2">
                    <AnswerAutocomplete
                      sport="rugby"
                      value={currentAnswer}
                      onChange={setCurrentAnswer}
                      onSubmit={handleSubmitAnswer}
                      disabled={isPending || isLoadingQuestion || gameComplete}
                      placeholder="Start typing to search answers..."
                      allowedAnswers={todaysQuestion?.answers}
                    />
                    <Button
                      onClick={handleSubmitAnswer}
                      className="bg-lime-500 hover:bg-lime-600 text-black font-bold"
                      disabled={isPending || !currentAnswer.trim() || isLoadingQuestion || gameComplete}
                    >
                      {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Submit
                    </Button>
                  </div>
                )}
                    <div className="space-y-2">
                      <h4 className="font-semibold mb-3 text-white">Answers Found:</h4>
                      {Array.from({ length: 10 }).map((_, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 transition-all ${foundAnswers[index] ? "bg-green-800/50 border-green-700 text-green-300" : gameComplete ? "bg-slate-700/50 border-slate-600 text-slate-400" : "bg-slate-800/50 border-slate-700 text-slate-500"}`}
                        >
                          <span className="font-medium">
                            {foundAnswers[index] ? foundAnswers[index] : `${index + 1}. ???`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <TenableLadder />
                  </div>
                </div>
              </CardContent>
            </Card>
            {gameComplete && (
              <Card className="bg-slate-800/80 border-slate-700">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    Challenge for {formatDisplayDate(todaysQuestion.question_date)} Complete!
                  </h3>
                  <p className="text-slate-300 mb-4">
                    You found {score} out of 10 answers! {strikes >= MAX_STRIKES && "(Maximum strikes reached)"}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      className="bg-lime-500 hover:bg-lime-600 text-black font-bold"
                      onClick={() => {
                        const shareText = `I scored ${score}/10 on Rugby TenaBall (${formatDisplayDate(todaysQuestion.question_date)}) on GAAmesquiz.com! ${strikes} strikes. Can you beat me? #RugbyTenaBall #GAAmesquiz`
                        const shareUrl = window.location.href
                        if (navigator.share) {
                          navigator
                            .share({
                              title: "My Rugby TenaBall Score!",
                              text: shareText,
                              url: shareUrl,
                            })
                            .catch(console.error)
                        } else {
                          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
                          window.open(twitterUrl, "_blank")
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Score
                    </Button>
                    <Button
                      onClick={() => setCurrentView("daily-stats")}
                      className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Stats
                    </Button>
                    <Button
                      onClick={() => setShowRevealPopup(true)}
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Reveal All Answers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {todaysQuestion && (
          <RevealPopup
            isOpen={showRevealPopup}
            onClose={() => setShowRevealPopup(false)}
            title={`Rugby TenaBall - ${formatDisplayDate(todaysQuestion.question_date)}`}
            answers={todaysQuestion.answers}
            foundAnswers={foundAnswers}
          />
        )}
      </main>
    </div>
  )
}
