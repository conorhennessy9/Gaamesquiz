"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"

interface RevealPopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  answers: string[]
  foundAnswers: string[]
}

export function RevealPopup({ isOpen, onClose, title, answers, foundAnswers }: RevealPopupProps) {
  if (!isOpen) return null

  const missedAnswers = answers.filter((answer) => !foundAnswers.includes(answer))

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-900 border-slate-600 w-full max-w-lg shadow-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-lime-400">
                {foundAnswers.length} / {answers.length}
              </div>
              <div className="text-slate-300 text-sm">answers found</div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 mb-4 border border-slate-600">
              <h4 className="text-lime-400 font-bold mb-2">Found Answers:</h4>
              <div className="flex flex-wrap gap-2">
                {foundAnswers.map((answer, index) => (
                  <span
                    key={index}
                    className="bg-green-700/40 border border-green-500 text-green-300 px-2 py-1 rounded text-sm"
                  >
                    {answer}
                  </span>
                ))}
                {foundAnswers.length === 0 && <span className="text-slate-400 text-sm">No answers found</span>}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
              <h4 className="text-red-400 font-bold mb-2">Missed Answers:</h4>
              <div className="flex flex-wrap gap-2">
                {missedAnswers.map((answer, index) => (
                  <span
                    key={index}
                    className="bg-red-700/40 border border-red-500 text-red-300 px-2 py-1 rounded text-sm"
                  >
                    {answer}
                  </span>
                ))}
                {missedAnswers.length === 0 && (
                  <span className="text-lime-400 text-sm">You found all the answers! 🎉</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg mb-4 border border-slate-600">
            <div className="text-center">
              <p className="text-white font-bold mb-1">Want more rugby games?</p>
              <p className="text-slate-300 text-sm mb-2">Visit www.gaamesquiz.com for daily challenges!</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={onClose} className="bg-lime-500 hover:bg-lime-600 text-black font-bold px-8">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
