import { describe, expect, it } from 'vitest'
import {
  formatDayAndTimePhrase,
  formatDayLabel,
  formatHeadlineDay,
  formatMoney,
  formatRelative,
  formatWindow,
  groupTrackingNumber,
} from './format'

const NOW = new Date(2026, 8, 24, 10, 0)
const at = (day: number, hour: number, minute = 0) => new Date(2026, 8, day, hour, minute)
const plain = (s: string) => s.replace(/\s/g, ' ')

describe('formatDayLabel', () => {
  it('uses relative words for nearby days', () => {
    expect(formatDayLabel(at(24, 18), NOW)).toBe('Today')
    expect(formatDayLabel(at(25, 8), NOW)).toBe('Tomorrow')
    expect(formatDayLabel(at(23, 8), NOW)).toBe('Yesterday')
  })

  it('uses the weekday within the next week, a date otherwise', () => {
    expect(formatDayLabel(at(26, 9), NOW)).toBe('Saturday')
    expect(formatDayLabel(at(22, 9), NOW)).toBe('Tue, Sep 22')
    expect(formatDayLabel(new Date(2026, 9, 5), NOW)).toBe('Mon, Oct 5')
  })
})

describe('headline and sentence phrases', () => {
  it('reads naturally in a headline', () => {
    expect(formatHeadlineDay(at(24, 18), NOW)).toBe('today')
    expect(formatHeadlineDay(at(26, 18), NOW)).toBe('Saturday')
  })

  it('reads naturally mid-sentence', () => {
    expect(plain(formatDayAndTimePhrase(at(23, 15, 14), NOW))).toBe('yesterday at 3:14 PM')
    expect(plain(formatDayAndTimePhrase(at(21, 15, 14), NOW))).toBe('on Mon, Sep 21 at 3:14 PM')
  })
})

describe('formatWindow', () => {
  it('shows a same-day window with compact times', () => {
    const window = { start: at(24, 14).toISOString(), end: at(24, 18, 30).toISOString() }
    expect(plain(formatWindow(window, NOW))).toBe('Today · 2 PM – 6:30 PM')
  })

  it('shows a multi-day window as a date range', () => {
    const window = { start: at(28, 9).toISOString(), end: at(30, 20).toISOString() }
    expect(formatWindow(window, NOW)).toBe('Mon, Sep 28 – Wed, Sep 30')
  })
})

describe('formatRelative', () => {
  it('describes how long ago something happened', () => {
    expect(formatRelative(new Date(NOW.getTime() - 20_000), NOW)).toBe('just now')
    expect(formatRelative(new Date(NOW.getTime() - 12 * 60_000), NOW)).toBe('12 min ago')
    expect(formatRelative(at(24, 7), NOW)).toBe('3 hr ago')
    expect(formatRelative(at(23, 22), NOW)).toBe('yesterday')
    expect(formatRelative(at(20, 9), NOW)).toBe('Sep 20')
  })
})

describe('misc formatting', () => {
  it('groups tracking numbers in fours', () => {
    expect(groupTrackingNumber('1Z84A2E90312345678')).toBe('1Z84 A2E9 0312 3456 78')
    expect(groupTrackingNumber('7719')).toBe('7719')
  })

  it('formats money', () => {
    expect(formatMoney(246.81)).toBe('$246.81')
    expect(formatMoney(0)).toBe('$0.00')
  })
})
