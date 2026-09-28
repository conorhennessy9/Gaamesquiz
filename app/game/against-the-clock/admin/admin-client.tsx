"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { getCurrentGMTDateString, formatDisplayDate } from "@/lib/date-utils"
import {
  getRugbyClockQuestions,
  createRugbyClockQuestion,
  updateRugbyClockQuestion,
  deleteRugbyClockQuestion,
  type RugbyClockQuestion,
} from "../actions"

export default function RugbyClockAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [questions, setQuestions] = useState<RugbyClockQuestion[]>([])
  const [editingQuestion, setEditingQuestion] = useState<RugbyClockQuestion | null>(null)
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    answers: "",
    question_date: getCurrentGMTDateString(),
  })
  const [showNewForm, setShowNewForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      loadQuestions()
    }
  }, [isAuthenticated])

  const loadQuestions = async () => {
    setIsLoading(true)
    try {
      const loadedQuestions = await getRugbyClockQuestions()
      setQuestions(loadedQuestions)
    } catch (error) {
      console.error("Error loading questions:", error)
      alert("Error loading questions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = () => {
    if (password === "Isaeden123!") {
      setIsAuthenticated(true)
    } else {
      alert("Incorrect password")
    }
  }

  const createQuestion = async () => {
    if (!newQuestion.question_text.trim() || !newQuestion.answers.trim()) {
      alert("Please fill in all fields")
      return
    }

    setIsSaving(true)
    try {
      const result = await createRugbyClockQuestion({
        question_text: newQuestion.question_text.trim(),
        answers: newQuestion.answers
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
        question_date: newQuestion.question_date,
      })

      if (result.success) {
        await loadQuestions()
        setNewQuestion({ question_text: "", answers: "", question_date: getCurrentGMTDateString() })
        setShowNewForm(false)
        alert("Question created successfully!")
      } else {
        alert(result.error || "Error creating question")
      }
    } catch (error) {
      console.error("Error creating question:", error)
      alert("Error creating question. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const updateQuestion = async () => {
    if (!editingQuestion) return

    setIsSaving(true)
    try {
      const result = await updateRugbyClockQuestion(editingQuestion.id, {
        question_text: editingQuestion.question_text,
        answers: editingQuestion.answers,
        question_date: editingQuestion.question_date,
      })

      if (result.success) {
        await loadQuestions()
        setEditingQuestion(null)
        alert("Question updated successfully!")
      } else {
        alert(result.error || "Error updating question")
      }
    } catch (error) {
      console.error("Error updating question:", error)
      alert("Error updating question. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const deleteQuestion = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    setIsSaving(true)
    try {
      const result = await deleteRugbyClockQuestion(id)

      if (result.success) {
        await loadQuestions()
        alert("Question deleted successfully!")
      } else {
        alert(result.error || "Error deleting question")
      }
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("Error deleting question. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Filter questions based on search term
  const filteredQuestions = questions.filter((question) => {
    if (!searchTerm.trim()) return true

    const searchLower = searchTerm.toLowerCase()
    const questionTextMatch = question.question_text.toLowerCase().includes(searchLower)
    const answersMatch = question.answers.some((answer) => answer.toLowerCase().includes(searchLower))

    return questionTextMatch || answersMatch
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            <Link href="/game/against-the-clock">
              <Button variant="outline" className="w-full">
                Back to Game
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <header className="p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/game/against-the-clock">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-white text-xl font-bold">Rugby Clock Admin</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Search and Add New Question */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Manage Questions</CardTitle>
                <Button
                  onClick={() => setShowNewForm(!showNewForm)}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isSaving}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search questions and answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Add New Question Form */}
              {showNewForm && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date (GMT)</label>
                    <Input
                      type="date"
                      value={newQuestion.question_date}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Question</label>
                    <Input
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                      placeholder="e.g., Name Rugby World Cup winning countries"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Answers (comma separated)</label>
                    <Textarea
                      value={newQuestion.answers}
                      onChange={(e) => setNewQuestion({ ...newQuestion, answers: e.target.value })}
                      placeholder="e.g., South Africa, New Zealand, Australia, England, France"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createQuestion} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      Save Question
                    </Button>
                    <Button onClick={() => setShowNewForm(false)} variant="outline" disabled={isSaving}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Results Info */}
          {searchTerm.trim() && (
            <div className="mb-4 text-white text-sm">
              Found {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} matching "
              {searchTerm}"
              {filteredQuestions.length !== questions.length && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="ml-2 text-white hover:bg-white/10"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}

          {/* Questions List */}
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Loading questions...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredQuestions
                .sort((a, b) => {
                  const dateA = new Date(a.question_date)
                  const dateB = new Date(b.question_date)
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)

                  const isAToday = dateA.toDateString() === today.toDateString()
                  const isBToday = dateB.toDateString() === today.toDateString()
                  const isAFuture = dateA > today
                  const isBFuture = dateB > today

                  // Today's questions first
                  if (isAToday && !isBToday) return -1
                  if (isBToday && !isAToday) return 1

                  // Both are today, sort by time if needed
                  if (isAToday && isBToday) return 0

                  // Future dates: nearest first (ascending)
                  if (isAFuture && isBFuture) {
                    return dateA.getTime() - dateB.getTime()
                  }

                  // Future vs past: future first
                  if (isAFuture && !isBFuture) return -1
                  if (isBFuture && !isAFuture) return 1

                  // Both are past: most recent first (descending)
                  return dateB.getTime() - dateA.getTime()
                })
                .map((question) => (
                  <Card key={question.id}>
                    <CardContent className="p-6">
                      {editingQuestion?.id === question.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Date</label>
                            <Input
                              type="date"
                              value={editingQuestion.question_date}
                              onChange={(e) =>
                                setEditingQuestion({
                                  ...editingQuestion,
                                  question_date: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Question</label>
                            <Input
                              value={editingQuestion.question_text}
                              onChange={(e) =>
                                setEditingQuestion({
                                  ...editingQuestion,
                                  question_text: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Answers</label>
                            <Textarea
                              value={editingQuestion.answers.join(", ")}
                              onChange={(e) =>
                                setEditingQuestion({
                                  ...editingQuestion,
                                  answers: e.target.value
                                    .split(",")
                                    .map((a) => a.trim())
                                    .filter((a) => a),
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={updateQuestion}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={isSaving}
                            >
                              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button onClick={() => setEditingQuestion(null)} variant="outline" disabled={isSaving}>
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                                  {formatDisplayDate(question.question_date)}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{question.question_text}</h3>
                              <div className="flex flex-wrap gap-1">
                                {question.answers.map((answer, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                    {answer}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingQuestion(question)}
                                disabled={isSaving}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteQuestion(question.id)}
                                className="text-red-600 hover:text-red-700"
                                disabled={isSaving}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {filteredQuestions.length === 0 && !isLoading && searchTerm.trim() && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No questions found matching "{searchTerm}"</p>
                <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-2">
                  Clear search
                </Button>
              </CardContent>
            </Card>
          )}

          {questions.length === 0 && !isLoading && !searchTerm.trim() && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No questions created yet. Add your first question above!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
