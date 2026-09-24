import { describe, expect, it } from 'vitest'
import { createSeedOrders } from '../data/seedOrders'
import type { Order } from '../types/order'
import { isOrderDelayed, summarizeTracking } from './tracking'

const NOW = new Date(2026, 8, 24, 10, 0)
const plain = (s: string | undefined) => s?.replace(/\s/g, ' ')

function seed(number: string): Order {
  const order = createSeedOrders(NOW).find((o) => o.number === number)
  if (!order) throw new Error(`missing seed ${number}`)
  return order
}

describe('summarizeTracking', () => {
  it('on the way: plain-language arrival day and brand tone', () => {
    const s = summarizeTracking(seed('VS-20418'), NOW)
    expect(s.situation).toBe('in_transit')
    expect(s.tone).toBe('brand')
    expect(s.headline).toBe('Arriving Saturday')
    expect(plain(s.keyDate?.value)).toBe('Saturday · 9 AM – 8 PM')
    expect(s.steps.map((step) => step.state)).toEqual(['complete', 'current', 'upcoming', 'upcoming'])
    expect(s.steps[1].label).toBe('In transit')
    expect(s.progressLabel).toBe('Step 2 of 4: In transit')
    expect(s.latestEvent?.title).toBe('Arrived at carrier facility')
  })

  it('out for delivery: arriving today with stops away', () => {
    const s = summarizeTracking(seed('VS-20533'), NOW)
    expect(s.situation).toBe('out_for_delivery')
    expect(s.headline).toBe('Arriving today')
    expect(s.detail).toContain('6 stops away')
  })

  it('delivered: success tone and every step complete', () => {
    const s = summarizeTracking(seed('VS-19877'), NOW)
    expect(s.situation).toBe('delivered')
    expect(s.tone).toBe('success')
    expect(s.headline).toBe('Delivered today')
    expect(s.steps.every((step) => step.state === 'complete')).toBe(true)
  })

  describe('delayed order', () => {
    it('shows the new estimate and strikes through the original', () => {
      const s = summarizeTracking(seed('VS-19102'), NOW)
      expect(s.situation).toBe('delayed')
      expect(s.tone).toBe('warning')
      expect(s.headline).toBe('Now arriving tomorrow')
      expect(s.keyDate?.label).toBe('New estimated delivery')
      expect(s.keyDate?.previous).toBe('Tue, Sep 22')
      expect(s.steps[1]).toMatchObject({ label: 'Delayed', state: 'current', tone: 'warning' })
    })

    it('is detected when the estimate passes even without a carrier delay notice', () => {
      const order = seed('VS-20418')
      order.estimatedDelivery = {
        start: new Date(2026, 8, 22, 9).toISOString(),
        end: new Date(2026, 8, 22, 20).toISOString(),
      }
      expect(isOrderDelayed(order, NOW)).toBe(true)
      const s = summarizeTracking(order, NOW)
      expect(s.situation).toBe('delayed')
      expect(s.headline).toBe('Running late')
      expect(s.keyDate).toMatchObject({ value: 'Waiting on a new estimate', previous: 'Tue, Sep 22' })
    })

    it('never applies to delivered orders', () => {
      const order = seed('VS-19877')
      order.estimatedDelivery = { start: '2026-01-01T09:00:00Z', end: '2026-01-01T20:00:00Z' }
      expect(isOrderDelayed(order, NOW)).toBe(false)
    })
  })

  describe('delivered but not received', () => {
    it('guides the customer and flags the delivered step', () => {
      const s = summarizeTracking(seed('VS-19640'), NOW)
      expect(s.situation).toBe('not_received')
      expect(s.tone).toBe('warning')
      expect(s.headline).toBe("Let's find your package")
      expect(s.steps[3]).toMatchObject({ label: 'Marked delivered', state: 'complete', tone: 'warning' })
    })

    it('switches to an investigation once a case is open', () => {
      const order = seed('VS-19640')
      order.supportCase = {
        id: 'MP-12345',
        type: 'not_received',
        status: 'open',
        openedAt: NOW.toISOString(),
        respondBy: new Date(2026, 8, 26, 10).toISOString(),
      }
      const s = summarizeTracking(order, NOW)
      expect(s.situation).toBe('investigating')
      expect(s.detail).toContain('#MP-12345')
      expect(s.keyDate).toEqual({ label: 'Next update by', value: 'Sat, Sep 26' })
    })

    it('returns to delivered once the package is found', () => {
      const order = seed('VS-19640')
      order.delivery!.receipt = 'confirmed'
      expect(summarizeTracking(order, NOW).situation).toBe('delivered')
    })
  })

  it('tracking not available yet: explains what is happening instead of an empty state', () => {
    const s = summarizeTracking(seed('VS-20671'), NOW)
    expect(s.situation).toBe('preparing')
    expect(s.trackingAvailable).toBe(false)
    expect(s.headline).toBe('Getting your order ready')
    expect(s.keyDate?.value).toBe('Mon, Sep 28 – Wed, Sep 30')
    expect(s.steps[0]).toMatchObject({ label: 'Preparing', state: 'current', date: 'Sep 24' })
    expect(s.latestEvent?.title).toBe('Preparing your order')
  })

  it('dates each reached step by its earliest event', () => {
    const s = summarizeTracking(seed('VS-19877'), NOW)
    expect(s.steps.map((step) => step.date)).toEqual(['Sep 20', 'Sep 21', 'Sep 24', 'Sep 24'])
  })
})
