/**
 * Gets the current date in GMT/UTC as a "YYYY-MM-DD" string.
 */
export function getCurrentGMTDateString(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = (now.getUTCMonth() + 1).toString().padStart(2, "0")
  const day = now.getUTCDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Gets a GMT/UTC date string "YYYY-MM-DD" from a Date object.
 * @param date Date object
 * @returns Formatted date string "YYYY-MM-DD"
 */
export function getCurrentGMTDateStringFromDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
  const day = date.getUTCDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Formats a Date object or a date string into a more readable format, e.g., "June 1st, 2025".
 * Assumes the input date is already in the intended timezone (e.g., GMT if that's the source).
 * @param dateInput Date object or a string like "YYYY-MM-DD"
 * @returns Formatted date string
 */
export function formatDisplayDate(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput + "T00:00:00Z") : dateInput
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "GMT",
  }
  const dayNum = date.getUTCDate()
  let suffix = "th"
  if (dayNum === 1 || dayNum === 21 || dayNum === 31) suffix = "st"
  else if (dayNum === 2 || dayNum === 22) suffix = "nd"
  else if (dayNum === 3 || dayNum === 23) suffix = "rd"

  const formattedDate = date.toLocaleDateString("en-US", options)
  // Replace the year part if it's part of the default toLocaleDateString output before adding suffix and year
  const parts = formattedDate.split(" ")
  if (parts.length === 3 && parts[1].endsWith(",")) {
    // e.g. "June 1,"
    return `${parts[0]} ${dayNum}${suffix}, ${date.getUTCFullYear()}`
  }
  return `${formattedDate.replace(/, \d{4}$/, "")}${suffix}, ${date.getUTCFullYear()}`
}

/**
 * Calculates the time remaining until midnight GMT.
 * @returns Object with hours, minutes, and a text representation.
 */
export function getTimeUntilMidnightGMT(): { hours: number; minutes: number; text: string } {
  const now = new Date()
  const nowGMTTotalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  const totalMinutesInDay = 24 * 60
  let minutesUntilMidnightGMT = totalMinutesInDay - nowGMTTotalMinutes
  if (minutesUntilMidnightGMT < 0) {
    minutesUntilMidnightGMT += totalMinutesInDay
  }
  const hours = Math.floor(minutesUntilMidnightGMT / 60)
  const minutes = minutesUntilMidnightGMT % 60
  return {
    hours,
    minutes,
    text: `${hours}h ${minutes}m`,
  }
}

/**
 * Converts a "YYYY-MM-DD" string to a Date object, interpreting it as GMT.
 * @param dateString "YYYY-MM-DD"
 * @returns Date object
 */
export function parseDateStringToGMT(dateString: string): Date {
  return new Date(dateString + "T00:00:00Z")
}

/**
 * Calculates the current day in a cycle based on GMT.
 * @param startDateString The start date of the cycle in "YYYY-MM-DD" format (defaults to "2024-01-01").
 * @param cycleLength The length of the cycle in days (defaults to 30).
 * @returns The current day number in the cycle (1-indexed).
 */
export function getCurrentGMTDayCycle(startDateString = "2024-01-01", cycleLength = 30): number {
  const startDate = new Date(startDateString + "T00:00:00Z") // Parse start date as GMT
  const today = new Date() // Current moment

  // Calculate days based on UTC dates to avoid timezone shifts affecting day count
  // getTime() returns milliseconds since epoch, which is UTC based.
  const todayUtcEpochDays = Math.floor(today.getTime() / (1000 * 60 * 60 * 24))
  const startUtcEpochDays = Math.floor(startDate.getTime() / (1000 * 60 * 60 * 24))

  const diffDays = todayUtcEpochDays - startUtcEpochDays

  if (diffDays < 0) return 1 // Or handle as an error/future date, default to day 1

  return (diffDays % cycleLength) + 1
}
