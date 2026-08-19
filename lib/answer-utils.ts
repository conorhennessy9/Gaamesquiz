/**
 * Calculates the Levenshtein distance between two strings
 * This measures how many single-character edits are needed to change one string into another
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Fill the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      )
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Normalizes a string for comparison by:
 * - Converting to lowercase
 * - Removing extra spaces
 * - Removing punctuation
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
}

/**
 * Checks if two strings contain the same words in any order
 */
export function arePermutations(str1: string, str2: string): boolean {
  const words1 = normalizeString(str1).split(" ").sort()
  const words2 = normalizeString(str2).split(" ").sort()

  if (words1.length !== words2.length) return false

  return words1.every((word, index) => word === words2[index])
}

/**
 * Checks if user input matches any individual word in the correct answer.
 * Only applies when the correct answer has MORE than one word (e.g. "Henry Arundell").
 * Single-word answers like "Kerry" / "Derry" are never matched this way to
 * prevent similar county/player names being confused.
 */
export function matchesAnyWord(userAnswer: string, correctAnswer: string, minWordLength = 4): boolean {
  const normalizedUser = normalizeString(userAnswer)
  const normalizedCorrect = normalizeString(correctAnswer)
  const correctWords = normalizedCorrect.split(" ")

  // Only allow word-level matching for multi-word answers
  if (correctWords.length < 2) return false

  const userWords = normalizedUser.split(" ")

  for (const userWord of userWords) {
    if (userWord.length < minWordLength) continue

    for (const correctWord of correctWords) {
      if (correctWord.length < minWordLength) continue

      // Exact word match
      if (userWord === correctWord) return true

      // Allow at most 1 typo in word match, but require high similarity
      const distance = levenshteinDistance(userWord, correctWord)
      const sim = similarityRatio(userWord, correctWord)
      if (distance <= 1 && sim >= 0.8) return true
    }
  }

  return false
}

/**
 * Calculates similarity ratio between two strings (0-1)
 * Higher value means more similar
 */
export function similarityRatio(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Checks if two strings are a flexible match based on:
 * - Exact match after normalization
 * - Same words in different order
 * - Partial word matches for multi-word answers (surnames)
 * - Small edit distance (for typos) with strict similarity floor
 *
 * The 0.80 similarity floor prevents "Derry" matching "Kerry",
 * "Down" matching "Cork", etc.
 */
export function isFlexibleMatch(userAnswer: string, correctAnswer: string, maxDistance = 2): boolean {
  const normalizedUser = normalizeString(userAnswer)
  const normalizedCorrect = normalizeString(correctAnswer)

  // Exact match after normalization
  if (normalizedUser === normalizedCorrect) return true

  // Same words in different order
  if (arePermutations(userAnswer, correctAnswer)) return true

  // Surname / single-word match inside a multi-word answer
  if (matchesAnyWord(userAnswer, correctAnswer)) return true

  // Typo tolerance — require at least 80% similarity
  const distance = levenshteinDistance(normalizedUser, normalizedCorrect)
  const similarity = similarityRatio(normalizedUser, normalizedCorrect)

  if (similarity < 0.80) return false

  // Cap allowed distance at 2 edits for short words, 3 for longer ones
  const maxAllowedDistance = normalizedCorrect.length <= 6 ? 1 : maxDistance
  return distance <= maxAllowedDistance
}

/**
 * Finds the best match from a list of correct answers.
 * Returns the matched answer string or null if nothing passes the similarity floor.
 * A single strict pass is used — there is no lenient fallback that bypasses
 * the 80 % similarity requirement, to avoid "Down" → "Cork" style false positives.
 */
export function findBestMatch(userAnswer: string, correctAnswers: string[], maxDistance = 2): string | null {
  for (const answer of correctAnswers) {
    if (isFlexibleMatch(userAnswer, answer, maxDistance)) {
      return answer
    }
  }
  return null
}
