export function getDateRange(period: string, customStart?: Date, customEnd?: Date) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let startDate: Date
  let endDate: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today

  switch (period) {
    case "today":
      startDate = today
      break
    case "yesterday":
      startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      endDate = new Date(today.getTime() - 1)
      break
    case "last7days":
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "last30days":
      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      break
    case "thisQuarter":
      const currentQuarter = Math.floor(now.getMonth() / 3)
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1)
      break
    case "lastQuarter":
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1
      const quarterYear = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear()
      const quarterMonth = lastQuarter < 0 ? 9 : lastQuarter * 3
      startDate = new Date(quarterYear, quarterMonth, 1)
      endDate = new Date(quarterYear, quarterMonth + 3, 0, 23, 59, 59)
      break
    case "thisYear":
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case "lastYear":
      startDate = new Date(now.getFullYear() - 1, 0, 1)
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
      break
    case "custom":
      if (customStart && customEnd) {
        startDate = customStart
        endDate = new Date(customEnd.getTime() + 24 * 60 * 60 * 1000 - 1)
      } else {
        startDate = today
      }
      break
    default:
      startDate = today
  }

  return { startDate, endDate }
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  const end = endDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

  if (start === end) return start
  return `${start} - ${end}`
}
