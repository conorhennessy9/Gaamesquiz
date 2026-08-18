"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, ArrowLeft, CheckCircle, XCircle, RotateCcw } from "lucide-react"
import Link from "next/link"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Quiz {
  id: string
  title: string
  description: string
  difficulty: string
  questions: Question[]
}

const sampleQuiz: Quiz = {
  id: "world-cup-legends",
  title: "Rugby World Cup Legends",
  description: "Test your knowledge of Rugby World Cup history and legendary players",
  difficulty: "Hard",
  questions: [
    {
      id: 1,
      question: "Which country won the first Rugby World Cup in 1987?",
      options: ["Australia", "New Zealand", "England", "South Africa"],
      correctAnswer: 1,
      explanation:
        "New Zealand won the inaugural Rugby World Cup in 1987, defeating France 29-9 in the final at Eden Park, Auckland.",
    },
    {
      id: 2,
      question: "Who is the all-time leading try scorer in Rugby World Cup history?",
      options: ["Jonah Lomu", "Bryan Habana", "Shane Williams", "Julian Savea"],
      correctAnswer: 1,
      explanation:
        "Bryan Habana holds the record with 15 tries across multiple World Cup tournaments, tied with Jonah Lomu.",
    },
    {
      id: 3,
      question: "Which player has scored the most points in a single Rugby World Cup tournament?",
      options: ["Jonny Wilkinson", "Grant Fox", "Gavin Hastings", "Michael Lynagh"],
      correctAnswer: 0,
      explanation:
        "Jonny Wilkinson scored 113 points in the 2003 Rugby World Cup, including the famous drop goal that won England the tournament.",
    },
    {
      id: 4,
      question: "How many teams participate in the Rugby World Cup?",
      options: ["16", "20", "24", "32"],
      correctAnswer: 1,
      explanation: "20 teams participate in the Rugby World Cup, divided into four pools of five teams each.",
    },
    {
      id: 5,
      question: "Which country has won the most Rugby World Cups?",
      options: ["New Zealand", "Australia", "South Africa", "England"],
      correctAnswer: 0,
      explanation:
        "New Zealand has won the Rugby World Cup three times (1987, 2011, 2015), more than any other nation.",
    },
  ],
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [quizCompleted, setQuizCompleted] = useState(false)

  const quiz = sampleQuiz // In a real app, this would be fetched based on params.id

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleQuizComplete()
    }
  }, [timeLeft, quizCompleted])

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (selectedAnswer === quiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      handleQuizComplete()
    }
  }

  const handleQuizComplete = () => {
    setQuizCompleted(true)
    setShowResult(true)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswers([])
    setTimeLeft(300)
    setQuizCompleted(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getScoreColor = () => {
    const percentage = (score / quiz.questions.length) * 100
    if (percentage >= 80) return "text-green-500"
    if (percentage >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreMessage = () => {
    const percentage = (score / quiz.questions.length) * 100
    if (percentage >= 80) return "Excellent! You're a rugby expert!"
    if (percentage >= 60) return "Good job! You know your rugby well."
    if (percentage >= 40) return "Not bad! Keep studying rugby history."
    return "Keep learning! Rugby has a rich history to explore."
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor()}`}>
                  {score}/{quiz.questions.length}
                </div>
                <div className="text-slate-400 mt-2">{Math.round((score / quiz.questions.length) * 100)}% Correct</div>
                <div className="text-slate-300 mt-4">{getScoreMessage()}</div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Review Your Answers</h3>
                {quiz.questions.map((question, index) => (
                  <div key={question.id} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {answers[index] === question.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-white font-medium mb-2">{question.question}</div>
                        <div className="text-sm text-slate-400 mb-2">
                          Your answer: {question.options[answers[index]]}
                        </div>
                        {answers[index] !== question.correctAnswer && (
                          <div className="text-sm text-green-400 mb-2">
                            Correct answer: {question.options[question.correctAnswer]}
                          </div>
                        )}
                        <div className="text-sm text-slate-300">{question.explanation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={resetQuiz}
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {quiz.difficulty}
            </Badge>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4" />
              <span className={timeLeft < 60 ? "text-red-400" : ""}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span>
              Score: {score}/{currentQuestion}
            </span>
          </div>
          <Progress value={((currentQuestion + 1) / quiz.questions.length) * 100} className="h-2 bg-slate-700" />
        </div>

        {/* Question Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-white">{quiz.questions[currentQuestion].question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quiz.questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  selectedAnswer === index
                    ? "border-green-500 bg-green-500/10 text-white"
                    : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index ? "border-green-500 bg-green-500" : "border-slate-500"
                    }`}
                  >
                    {selectedAnswer === index && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Next Button */}
        <Button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestion === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
        </Button>
      </div>
    </div>
  )
}
