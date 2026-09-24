import type { DateWindow, Order } from '../types/order'

const LOCALE = 'en-US'
const MINUTE = 60_000
const HOUR = 60 * MINUTE

const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' })
const hourFmt = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric' })
const weekdayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' })
const shortDateFmt = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})
const monthDayFmt = new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric' })
const fullDateFmt = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export const toDate = (value: string | Date) => (value instanceof Date ? value : new Date(value))

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function calendarDayDiff(date: Date, now: Date) {
  return Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / (24 * HOUR))
}

export function formatTime(value: string | Date, compact = false) {
  const date = toDate(value)
  if (compact && date.getMinutes() === 0) return hourFmt.format(date)
  return timeFmt.format(date)
}

export const formatShortDate = (value: string | Date) => shortDateFmt.format(toDate(value))

export const formatMonthDay = (value: string | Date) => monthDayFmt.format(toDate(value))

export const formatFullDate = (value: string | Date) => fullDateFmt.format(toDate(value))

export function formatDayLabel(value: string | Date, now: Date) {
  const date = toDate(value)
  const diff = calendarDayDiff(date, now)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1 && diff < 7) return weekdayFmt.format(date)
  return formatShortDate(date)
}

export function formatDayPhrase(value: string | Date, now: Date) {
  const label = formatDayLabel(value, now)
  if (label === 'Today' || label === 'Tomorrow' || label === 'Yesterday') return label.toLowerCase()
  return `on ${label}`
}

export function formatHeadlineDay(value: string | Date, now: Date) {
  const label = formatDayLabel(value, now)
  return label === 'Today' || label === 'Tomorrow' || label === 'Yesterday' ? label.toLowerCase() : label
}

export function formatDayAndTime(value: string | Date, now: Date) {
  return `${formatDayLabel(value, now)} at ${formatTime(value)}`
}

export function formatDayAndTimePhrase(value: string | Date, now: Date) {
  return `${formatDayPhrase(value, now)} at ${formatTime(value)}`
}

export function formatWindow(window: DateWindow, now: Date) {
  const start = toDate(window.start)
  const end = toDate(window.end)
  if (calendarDayDiff(start, end) === 0) {
    return `${formatDayLabel(start, now)} · ${formatTime(start, true)} – ${formatTime(end, true)}`
  }
  return `${formatShortDate(start)} – ${formatShortDate(end)}`
}

export function formatRelative(value: string | Date, now: Date) {
  const date = toDate(value)
  const diff = now.getTime() - date.getTime()
  if (diff < MINUTE) return 'just now'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`
  if (diff < 24 * HOUR && calendarDayDiff(date, now) === 0) return `${Math.floor(diff / HOUR)} hr ago`
  if (calendarDayDiff(date, now) === -1) return 'yesterday'
  return formatMonthDay(date)
}

const moneyFormatters = new Map<string, Intl.NumberFormat>()

export function formatMoney(amount: number, currency = 'USD') {
  let fmt = moneyFormatters.get(currency)
  if (!fmt) {
    fmt = new Intl.NumberFormat(LOCALE, { style: 'currency', currency })
    moneyFormatters.set(currency, fmt)
  }
  return fmt.format(amount)
}

export const groupTrackingNumber = (value: string) => value.replace(/(.{4})(?=.)/g, '$1 ')

export const itemCount = (order: Pick<Order, 'items'>) => order.items.reduce((sum, item) => sum + item.quantity, 0)

export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`
