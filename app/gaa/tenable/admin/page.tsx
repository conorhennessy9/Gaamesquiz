"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { getCurrentGMTDateString, formatDisplayDate } from "@/lib/date-utils"
import {
  getGAATenaBallQuestions,
  createGAATenaBallQuestion,
  updateGAATenaBallQuestion,
  deleteGAATenaBallQuestion,
  type GAATenaBallQuestion,
} from "../actions"

export default function GAATenaBallAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [questions, setQuestions] = useState<GAATenaBallQuestion[]>([])
  const [editingQuestion, setEditingQuestion] = useState<GAATenaBallQuestion | null>(null)
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    answers: "",
    question_date: getCurrentGMTDateString(),
  })
  const [showNewForm, setShowNewForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const authStatus = localStorage.getItem("gaaTenaBallAdminAuth")
    const authTime = localStorage.getItem("gaaTenaBallAdminAuthTime")

    if (authStatus === "true" && authTime) {
      const timeDiff = Date.now() - Number.parseInt(authTime)
      // Session expires after 7 days
      if (timeDiff < 7 * 24 * 60 * 60 * 1000) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem("gaaTenaBallAdminAuth")
        localStorage.removeItem("gaaTenaBallAdminAuthTime")
      }
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadQuestions()
    }
  }, [isAuthenticated])

  const loadQuestions = async () => {
    setIsLoading(true)
    try {
      const loadedQuestions = await getGAATenaBallQuestions()
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
      localStorage.setItem("gaaTenaBallAdminAuth", "true")
      localStorage.setItem("gaaTenaBallAdminAuthTime", Date.now().toString())
    } else {
      alert("Incorrect password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("gaaTenaBallAdminAuth")
    localStorage.removeItem("gaaTenaBallAdminAuthTime")
  }

  const createQuestion = async () => {
    if (!newQuestion.question_text.trim() || !newQuestion.answers.trim()) {
      alert("Please fill in all fields")
      return
    }

    const answersArray = newQuestion.answers
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a)

    if (answersArray.length !== 10) {
      alert("Please provide exactly 10 answers separated by commas")
      return
    }

    setIsSaving(true)
    try {
      const result = await createGAATenaBallQuestion(
        newQuestion.question_text.trim(),
        answersArray,
        newQuestion.question_date,
      )

      if (result.success) {
        await loadQuestions()
        setNewQuestion({ question_text: "", answers: "", question_date: getCurrentGMTDateString() })
        setShowNewForm(false)
        alert("Question created successfully!")
      } else {
        alert(result.message || "Error creating question")
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

    if (editingQuestion.answers.length !== 10) {
      alert("Please provide exactly 10 answers")
      return
    }

    setIsSaving(true)
    try {
      const result = await updateGAATenaBallQuestion(
        editingQuestion.id,
        editingQuestion.question_text,
        editingQuestion.answers,
        editingQuestion.question_date,
      )

      if (result.success) {
        await loadQuestions()
        setEditingQuestion(null)
        alert("Question updated successfully!")
      } else {
        alert(result.message || "Error updating question")
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
      const result = await deleteGAATenaBallQuestion(id)

      if (result.success) {
        await loadQuestions()
        alert("Question deleted successfully!")
      } else {
        alert(result.message || "Error deleting question")
      }
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("Error deleting question. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
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
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            <Link href="/gaa/tenable">
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <header className="p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/gaa/tenable">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <h1 className="text-white text-xl font-bold">GAA TenaBall Admin</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-600 text-red-400 hover:bg-red-900/20"
            >
              <X className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Manage Questions</CardTitle>
                <Button
                  onClick={() => setShowNewForm(!showNewForm)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSaving}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            {showNewForm && (
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date (YYYY-MM-DD)</label>
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
                    placeholder="e.g., Name All-Ireland Football winning counties"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Answers (comma separated, 10 required)</label>
                  <Textarea
                    value={newQuestion.answers}
                    onChange={(e) => setNewQuestion({ ...newQuestion, answers: e.target.value })}
                    placeholder="e.g., Kerry, Dublin, Galway, Mayo, Cork, Tyrone, Donegal, Meath, Down, Offaly"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Current count: {newQuestion.answers.split(",").filter((a) => a.trim()).length}/10
                  </p>
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
              </CardContent>
            )}
          </Card>

          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Loading questions...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions
                .sort((a, b) => a.question_date.localeCompare(b.question_date))
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
                            <label className="block text-sm font-medium mb-2">Answers (10 required)</label>
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
                            <p className="text-sm text-gray-500 mt-1">
                              Current count: {editingQuestion.answers.length}/10
                            </p>
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
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                  {formatDisplayDate(question.question_date)}
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                  {question.answers.length} answers
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{question.question_text}</h3>
                              <div className="flex flex-wrap gap-1">
                                {question.answers.map((answer, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                    {index + 1}. {answer}
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

          {questions.length === 0 && !isLoading && (
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
