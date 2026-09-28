"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Edit, Trash2, X, LogOut, Clock, CalendarIcon, Loader2 } from "lucide-react" // Renamed Calendar to CalendarIcon
import Link from "next/link"
import {
  getRugbyTenaBallQuestions,
  createRugbyTenaBallQuestion,
  updateRugbyTenaBallQuestion,
  deleteRugbyTenaBallQuestion,
} from "../actions"
import type { RugbyTenaBallQuestion } from "../types"
import {
  getCurrentGMTDateString,
  getTimeUntilMidnightGMT,
  formatDisplayDate,
  parseDateStringToGMT,
} from "@/lib/date-utils"

type QuestionFormState = {
  question_date: string // "YYYY-MM-DD"
  question_text: string
  answers: string[]
}

export default function RugbyTenaBallAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [questions, setQuestions] = useState<RugbyTenaBallQuestion[]>([])
  const [editingQuestion, setEditingQuestion] = useState<RugbyTenaBallQuestion | null>(null)
  const [newQuestionForm, setNewQuestionForm] = useState<QuestionFormState>({
    question_date: getCurrentGMTDateString(), // Default to today's GMT date
    question_text: "",
    answers: Array(10).fill(""),
  })
  const [showNewForm, setShowNewForm] = useState(false)
  const [currentGMTDate, setCurrentGMTDate] = useState<string>("")
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const authStatus = localStorage.getItem("rugbyTenaBallAdminAuth")
    const authTime = localStorage.getItem("rugbyTenaBallAdminAuthTime")
    if (authStatus === "true" && authTime && Date.now() - Number.parseInt(authTime) < 7 * 24 * 60 * 60 * 1000) {
      setIsAuthenticated(true)
    } else {
      localStorage.removeItem("rugbyTenaBallAdminAuth")
      localStorage.removeItem("rugbyTenaBallAdminAuthTime")
    }

    setCurrentGMTDate(getCurrentGMTDateString())
    setTimeUntilMidnight(getTimeUntilMidnightGMT().text)
    const timer = setInterval(() => {
      setCurrentGMTDate(getCurrentGMTDateString())
      setTimeUntilMidnight(getTimeUntilMidnightGMT().text)
    }, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  const loadQuestionsFromDB = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedQuestions = await getRugbyTenaBallQuestions()
      setQuestions(fetchedQuestions)
    } catch (err: any) {
      setError(err.message || "Failed to load questions.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadQuestionsFromDB()
    }
  }, [isAuthenticated, loadQuestionsFromDB])

  const handleLogin = () => {
    if (password === "Isaeden123!") {
      setIsAuthenticated(true)
      localStorage.setItem("rugbyTenaBallAdminAuth", "true")
      localStorage.setItem("rugbyTenaBallAdminAuthTime", Date.now().toString())
    } else {
      alert("Incorrect password")
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("rugbyTenaBallAdminAuth")
    localStorage.removeItem("rugbyTenaBallAdminAuthTime")
  }

  const handleCreateQuestion = () => {
    if (
      !newQuestionForm.question_date ||
      !newQuestionForm.question_text.trim() ||
      newQuestionForm.answers.some((a) => !a.trim()) ||
      newQuestionForm.answers.length !== 10
    ) {
      alert("Please select a date, fill in the question title, and all 10 answers.")
      return
    }
    startTransition(async () => {
      setError(null)
      const result = await createRugbyTenaBallQuestion(newQuestionForm)
      if (result.success && result.data) {
        setQuestions((prev) =>
          [...prev, result.data!].sort(
            (a, b) => parseDateStringToGMT(a.question_date).getTime() - parseDateStringToGMT(b.question_date).getTime(),
          ),
        )
        setNewQuestionForm({ question_date: getCurrentGMTDateString(), question_text: "", answers: Array(10).fill("") })
        setShowNewForm(false)
      } else {
        setError(result.error || "Failed to create question.")
        alert(result.error || "Failed to create question.")
      }
    })
  }

  const handleUpdateQuestion = () => {
    if (
      !editingQuestion ||
      !editingQuestion.question_date ||
      !editingQuestion.question_text.trim() ||
      editingQuestion.answers.some((a) => !a.trim()) ||
      editingQuestion.answers.length !== 10
    ) {
      alert("Please select a date, fill in the question title, and all 10 answers.")
      return
    }
    startTransition(async () => {
      setError(null)
      const { id, created_at, ...updateData } = editingQuestion
      const result = await updateRugbyTenaBallQuestion(editingQuestion.id, updateData)
      if (result.success && result.data) {
        setQuestions((prev) =>
          prev
            .map((q) => (q.id === result.data!.id ? result.data! : q))
            .sort(
              (a, b) =>
                parseDateStringToGMT(a.question_date).getTime() - parseDateStringToGMT(b.question_date).getTime(),
            ),
        )
        setEditingQuestion(null)
      } else {
        setError(result.error || "Failed to update question.")
        alert(result.error || "Failed to update question.")
      }
    })
  }

  const handleDeleteQuestion = (id: number) => {
    if (confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      startTransition(async () => {
        setError(null)
        const result = await deleteRugbyTenaBallQuestion(id)
        if (result.success) {
          setQuestions((prev) => prev.filter((q) => q.id !== id))
        } else {
          setError(result.error || "Failed to delete question.")
          alert(result.error || "Failed to delete question.")
        }
      })
    }
  }

  const handleNewAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...newQuestionForm.answers]
    updatedAnswers[index] = value
    setNewQuestionForm((prev) => ({ ...prev, answers: updatedAnswers }))
  }

  const handleEditAnswerChange = (index: number, value: string) => {
    if (!editingQuestion) return
    const updatedAnswers = [...editingQuestion.answers]
    updatedAnswers[index] = value
    setEditingQuestion((prev) => (prev ? { ...prev, answers: updatedAnswers } : null))
  }

  if (!isAuthenticated) {
    // Login form remains the same
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Rugby TenaBall Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              className="bg-slate-700 border-slate-600 placeholder-slate-400"
            />
            <Button onClick={handleLogin} className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold">
              Login
            </Button>
            <Link href="/game/rugby-tenable" className="block mt-2">
              <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700">
                Back to Game
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="p-4 border-b border-slate-700">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/game/rugby-tenable">
            <Button variant="ghost" size="icon" className="hover:bg-slate-700">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Rugby TenaBall Admin</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <CalendarIcon className="w-4 h-4" /> Live Date (GMT):{" "}
              {currentGMTDate ? formatDisplayDate(currentGMTDate) : "Loading..."}
              <Clock className="w-4 h-4 ml-2" /> {timeUntilMidnight} (until next GMT day)
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-600 text-red-400 hover:bg-red-700 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-700 text-red-300 rounded">{error}</div>}
          <Card className="mb-6 bg-slate-800/80 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Manage Daily Questions by Date</CardTitle>
                <Button
                  onClick={() => {
                    setShowNewForm(true)
                    setEditingQuestion(null)
                    setNewQuestionForm({
                      question_date: getCurrentGMTDateString(), // Default to today
                      question_text: "",
                      answers: Array(10).fill(""),
                    })
                  }}
                  className="bg-lime-500 hover:bg-lime-600 text-black"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Question
                </Button>
              </div>
            </CardHeader>
            {(showNewForm || editingQuestion) && (
              <CardContent className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold">
                  {editingQuestion ? "Edit" : "New"} Question for Date:{" "}
                  {editingQuestion
                    ? formatDisplayDate(editingQuestion.question_date)
                    : formatDisplayDate(newQuestionForm.question_date)}
                </h3>
                <div>
                  <label htmlFor="questionDate" className="block text-sm font-medium mb-1">
                    Question Date (GMT)
                  </label>
                  <Input
                    type="date"
                    id="questionDate"
                    value={editingQuestion ? editingQuestion.question_date : newQuestionForm.question_date}
                    onChange={(e) => {
                      const dateValue = e.target.value // "YYYY-MM-DD"
                      if (editingQuestion) setEditingQuestion({ ...editingQuestion, question_date: dateValue })
                      else setNewQuestionForm({ ...newQuestionForm, question_date: dateValue })
                    }}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Question Title</label>
                  <Input
                    value={editingQuestion ? editingQuestion.question_text : newQuestionForm.question_text}
                    onChange={(e) => {
                      if (editingQuestion) setEditingQuestion({ ...editingQuestion, question_text: e.target.value })
                      else setNewQuestionForm({ ...newQuestionForm, question_text: e.target.value })
                    }}
                    placeholder="e.g., Last 10 Rugby World Cup Winners"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Answers (10 required)</label>
                  {Array(10)
                    .fill(0)
                    .map((_, index) => (
                      <Input
                        key={index}
                        value={editingQuestion ? editingQuestion.answers[index] : newQuestionForm.answers[index]}
                        onChange={(e) => {
                          if (editingQuestion) handleEditAnswerChange(index, e.target.value)
                          else handleNewAnswerChange(index, e.target.value)
                        }}
                        placeholder={`Answer ${index + 1}`}
                        className="bg-slate-700 border-slate-600 mb-2"
                      />
                    ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isPending}
                  >
                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingQuestion ? "Save Changes" : "Create Question"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNewForm(false)
                      setEditingQuestion(null)
                    }}
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-700"
                    disabled={isPending}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
              <p className="ml-2">Loading questions...</p>
            </div>
          )}

          {!isLoading && questions.length === 0 && (
            <Card className="bg-slate-800/80 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                No questions found in the database. Click "Add Question" to start.
              </CardContent>
            </Card>
          )}

          {!isLoading && questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((q) => (
                <Card
                  key={q.id}
                  className={`bg-slate-800/80 border-slate-700 ${q.question_date === currentGMTDate ? "border-lime-500 border-2" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${q.question_date === currentGMTDate ? "bg-lime-500 text-black" : "bg-slate-700"}`}
                          >
                            {formatDisplayDate(q.question_date)}
                          </span>
                        </div>
                        <h3 className="text-md font-semibold mb-1">{q.question_text}</h3>
                        <div className="text-xs text-slate-400 grid grid-cols-2 gap-x-2">
                          {q.answers.map((ans, i) => (
                            <span key={i} className="truncate">
                              {i + 1}. {ans}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 ml-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingQuestion(JSON.parse(JSON.stringify(q))) // Deep copy
                            setShowNewForm(false)
                          }}
                          className="border-slate-600 hover:bg-slate-700"
                          disabled={isPending}
                        >
                          <Edit className="w-3 h-3 sm:mr-1" /> <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="border-red-600 text-red-400 hover:bg-red-700 hover:text-white"
                          disabled={isPending && editingQuestion?.id === q.id}
                        >
                          {isPending && editingQuestion?.id === q.id ? (
                            <Loader2 className="w-3 h-3 sm:mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3 sm:mr-1" />
                          )}
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
