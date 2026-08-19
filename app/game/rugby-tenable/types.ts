export interface RugbyTenaBallQuestion {
  id: number // SERIAL from DB
  question_date: string // "YYYY-MM-DD" format, representing GMT date
  question_text: string // The main question/title
  answers: string[] // Array of 10 answers
  created_at?: string // Timestamp
}

// For game state, user progress etc. (can remain in localStorage for now)
export interface GameStats {
  questionsCompleted: number
  totalCorrectAnswers: number
  totalStrikes: number
  averageScore: number
  bestScore: number
  currentStreak: number
  longestStreak: number
  gamesPlayed: number
  perfectGames: number
  lastPlayedDate: string // This should store "YYYY-MM-DD"
}

export interface DailyGameProgress {
  date: string // "YYYY-MM-DD" format, representing GMT date of the game played
  completed: boolean
  score: number
  strikes: number
  timeToComplete: number // in seconds
  foundAnswers: string[]
}
