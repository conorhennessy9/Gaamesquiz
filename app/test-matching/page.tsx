"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { findBestMatch } from "@/lib/answer-utils"
import { CheckCircle, XCircle } from "lucide-react"

export default function TestMatchingPage() {
  const [userInput, setUserInput] = useState("")
  const [result, setResult] = useState<{ matched: string | null; isMatch: boolean } | null>(null)

  const correctAnswers = [
    "Henry Arundell",
    "Owen Farrell",
    "Maro Itoje",
    "Marcus Smith",
    "Croke Park",
    "Semple Stadium",
    "Aaron Gillane",
    "Cian Lynch",
  ]

  const testMatch = () => {
    const matched = findBestMatch(userInput, correctAnswers)
    setResult({
      matched,
      isMatch: matched !== null,
    })
  }

  const testCases = [
    { input: "arundell", expected: "Henry Arundell" },
    { input: "Arundel", expected: "Henry Arundell" },
    { input: "henry", expected: "Henry Arundell" },
    { input: "Owen", expected: "Owen Farrell" },
    { input: "farrel", expected: "Owen Farrell" },
    { input: "Itoje", expected: "Maro Itoje" },
    { input: "croke", expected: "Croke Park" },
    { input: "semple", expected: "Semple Stadium" },
    { input: "gillane", expected: "Aaron Gillane" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Enhanced Answer Matching Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Correct Answers:</h3>
              <div className="flex flex-wrap gap-2">
                {correctAnswers.map((answer) => (
                  <span
                    key={answer}
                    className="px-3 py-1 bg-slate-700 text-white rounded-full text-sm"
                  >
                    {answer}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Test Your Answer:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && testMatch()}
                    placeholder="Try: arundell, henry, farrel, croke..."
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                  <Button
                    onClick={testMatch}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                  >
                    Test Match
                  </Button>
                </div>
              </div>

              {result && (
                <Card
                  className={`border-2 ${
                    result.isMatch
                      ? "bg-green-900/20 border-green-500"
                      : "bg-red-900/20 border-red-500"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      {result.isMatch ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-500" />
                      )}
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {result.isMatch ? "Match Found!" : "No Match"}
                        </p>
                        {result.matched && (
                          <p className="text-slate-300">
                            Your answer &quot;{userInput}&quot; matches: <strong>{result.matched}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Example Test Cases:</h3>
              <div className="space-y-2">
                {testCases.map((testCase, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      setUserInput(testCase.input)
                      const matched = findBestMatch(testCase.input, correctAnswers)
                      setResult({
                        matched,
                        isMatch: matched !== null,
                      })
                    }}
                    variant="outline"
                    className="w-full justify-start text-left bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
                  >
                    <span className="font-mono text-amber-400">&quot;{testCase.input}&quot;</span>
                    <span className="mx-2">→</span>
                    <span className="text-slate-300">{testCase.expected}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-white">Matching Features:</h4>
              <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                <li>Surname matching: &quot;arundell&quot; matches &quot;Henry Arundell&quot;</li>
                <li>First name matching: &quot;henry&quot; matches &quot;Henry Arundell&quot;</li>
                <li>Typo tolerance: &quot;farrel&quot; matches &quot;Owen Farrell&quot;</li>
                <li>Case insensitive: &quot;CROKE&quot; matches &quot;Croke Park&quot;</li>
                <li>Partial word: &quot;semple&quot; matches &quot;Semple Stadium&quot;</li>
                <li>Dynamic tolerance: Longer words allow more typos (20% of word length)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
