import { subDays } from 'date-fns'

export const getLastTradingDate = () => {
  let yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (yesterday.getDay() === 0) {
    yesterday.setDate(yesterday.getDate() - 2)
  } else if (yesterday.getDay() === 6) {
    yesterday.setDate(yesterday.getDate() - 1)
  }

  return yesterday.toISOString().split('T')[0]
}

export const isTradingDay = (date) => {
  const day = date.getDay()
  return day !== 0 && day !== 6
}

export const getTradingDates = (days) => {
  const tradingDates = []
  let tradingDaysProcessed = 0
  let daysChecked = 0
  while (tradingDaysProcessed < days) {
    const date = subDays(new Date(), daysChecked + 1)
    if (isTradingDay(date)) {
      const dateOnly = date.toISOString().split('T')[0]
      tradingDates.push(dateOnly)
      tradingDaysProcessed += 1
    }
    daysChecked += 1
  }
  return tradingDates.reverse()
}

export const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
