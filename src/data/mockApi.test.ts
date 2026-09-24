import { describe, expect, it } from 'vitest'
import {
  confirmReceipt,
  fetchOrder,
  NetworkError,
  normalizeOrderNumber,
  OrderNotFoundError,
  reportIssue,
  sendSupportMessage,
  updateAlerts,
} from './mockApi'

describe('normalizeOrderNumber', () => {
  it.each([
    ['VS-20418', 'VS-20418'],
    ['  #vs-20418 ', 'VS-20418'],
    ['20418', 'VS-20418'],
    ['vs20418', 'VS-20418'],
  ])('%j → %s', (input, expected) => {
    expect(normalizeOrderNumber(input)).toBe(expected)
  })
})

describe('mock orders API', () => {
  it('fetches an order by number', async () => {
    const order = await fetchOrder('vs-20418')
    expect(order.number).toBe('VS-20418')
    expect(order.items).toHaveLength(2)
  })

  it('rejects unknown orders and simulated failures with typed errors', async () => {
    await expect(fetchOrder('VS-00000')).rejects.toBeInstanceOf(OrderNotFoundError)
    await expect(fetchOrder('VS-20418', { fail: true })).rejects.toBeInstanceOf(NetworkError)
  })

  it('returns copies, so callers cannot mutate the store', async () => {
    const first = await fetchOrder('VS-20418')
    first.items = []
    const second = await fetchOrder('VS-20418')
    expect(second.items).toHaveLength(2)
  })

  it('persists alert preferences', async () => {
    await updateAlerts('VS-20418', true)
    expect((await fetchOrder('VS-20418')).alertsEnabled).toBe(true)
  })

  it('opens a missing-package case and closes it when the package is found', async () => {
    const reported = await reportIssue('VS-19877', { type: 'not_received', resolution: 'refund', details: '  ' })
    expect(reported.supportCase).toMatchObject({ type: 'not_received', status: 'open', resolution: 'refund' })
    expect(reported.supportCase?.id).toMatch(/^MP-\d{5}$/)
    expect(reported.supportCase?.details).toBeUndefined()
    expect(reported.delivery?.receipt).toBe('not_received')

    const found = await confirmReceipt('VS-19877', 'confirmed')
    expect(found.delivery?.receipt).toBe('confirmed')
    expect(found.supportCase?.status).toBe('closed')
  })

  it('gives situation-aware support replies', async () => {
    const delayed = await fetchOrder('VS-19102')
    expect(await sendSupportMessage(delayed, 'Can I get a refund?')).toMatch(/full refund or a free replacement/)
    const pending = await fetchOrder('VS-20671')
    expect(await sendSupportMessage(pending, 'I want to cancel')).toMatch(/hasn't shipped yet/)
    expect(await sendSupportMessage(null, 'hello')).toMatch(/order number/)
  })
})
