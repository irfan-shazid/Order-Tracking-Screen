import { formatShortDate, formatWindow } from '../lib/format'
import { getDelayGuaranteeDate, getSituation } from '../lib/tracking'
import type { IssueType, Order, ReceiptStatus, ReportIssueInput, SupportCase } from '../types/order'
import { createSeedOrders } from './seedOrders'

export class OrderNotFoundError extends Error {
  constructor(orderNumber: string) {
    super(`No order found for ${orderNumber}`)
    this.name = 'OrderNotFoundError'
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message)
    this.name = 'NetworkError'
  }
}

const config = { latencyScale: 1 }

export function configureMockApi(options: { latencyScale: number }) {
  config.latencyScale = options.latencyScale
}

let db: Map<string, Order> | null = null

function getDb() {
  if (!db) db = new Map(createSeedOrders().map((o) => [o.number, o]))
  return db
}

export function resetMockDb(now = new Date()) {
  db = new Map(createSeedOrders(now).map((o) => [o.number, o]))
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms * config.latencyScale))

const clone = <T>(value: T): T => structuredClone(value)

export function normalizeOrderNumber(input: string) {
  const cleaned = input.trim().toUpperCase().replace(/^#/, '').replace(/\s+/g, '')
  if (/^\d+$/.test(cleaned)) return `VS-${cleaned}`
  return cleaned.replace(/^VS(?=\d)/, 'VS-')
}

function getOrThrow(orderNumber: string) {
  const order = getDb().get(normalizeOrderNumber(orderNumber))
  if (!order) throw new OrderNotFoundError(orderNumber)
  return order
}

export interface FetchOptions {
  latencyMs?: number
  fail?: boolean
}

export async function fetchOrder(orderNumber: string, options: FetchOptions = {}) {
  await wait(options.latencyMs ?? 700)
  if (options.fail) throw new NetworkError("We couldn't reach the server")
  const order = getOrThrow(orderNumber)
  order.lastSyncedAt = new Date().toISOString()
  return clone(order)
}

export async function updateAlerts(orderNumber: string, enabled: boolean) {
  await wait(350)
  const order = getOrThrow(orderNumber)
  order.alertsEnabled = enabled
  return clone(order)
}

export async function confirmReceipt(orderNumber: string, receipt: Exclude<ReceiptStatus, 'unconfirmed'>) {
  await wait(450)
  const order = getOrThrow(orderNumber)
  if (!order.delivery) throw new Error('Order has not been delivered')
  order.delivery.receipt = receipt
  if (receipt === 'confirmed' && order.supportCase?.type === 'not_received') {
    order.supportCase.status = 'closed'
  }
  return clone(order)
}

const CASE_PREFIX: Record<IssueType, string> = {
  not_received: 'MP',
  late: 'DL',
  damaged: 'DM',
  wrong_item: 'WI',
  other: 'CS',
}

const RESPONSE_HOURS: Record<IssueType, number> = {
  not_received: 48,
  late: 24,
  damaged: 24,
  wrong_item: 24,
  other: 24,
}

export async function reportIssue(orderNumber: string, input: ReportIssueInput) {
  await wait(900)
  const order = getOrThrow(orderNumber)
  const openedAt = new Date()
  const supportCase: SupportCase = {
    id: `${CASE_PREFIX[input.type]}-${Math.floor(10_000 + Math.random() * 90_000)}`,
    type: input.type,
    status: 'open',
    openedAt: openedAt.toISOString(),
    respondBy: new Date(openedAt.getTime() + RESPONSE_HOURS[input.type] * 3_600_000).toISOString(),
    resolution: input.resolution,
    details: input.details?.trim() || undefined,
  }
  order.supportCase = supportCase
  if (input.type === 'not_received' && order.delivery) order.delivery.receipt = 'not_received'
  return clone(order)
}

export async function sendSupportMessage(order: Order | null, message: string) {
  await wait(1100)
  const now = new Date()
  const text = message.toLowerCase()

  if (!order) {
    return 'Thanks for reaching out! Could you share your order number? It starts with VS- and is in your confirmation email.'
  }

  const situation = getSituation(order, now)

  if (/refund|money|cancel|replace/.test(text)) {
    switch (situation) {
      case 'preparing':
        return "Your order hasn't shipped yet, so it can still be cancelled for a full refund. Would you like me to cancel it, or keep it on its way?"
      case 'delayed':
        return `I'm sorry about the wait. If it hasn't arrived by ${formatShortDate(getDelayGuaranteeDate(order))}, you can choose a full refund or a free replacement — no need to send anything back.`
      case 'not_received':
      case 'investigating':
        return "Once the carrier investigation wraps up, we'll send your replacement or refund automatically. You won't need to do anything else."
      default:
        return "You can return any item within 30 days of delivery for a full refund. I can start a return for you whenever you're ready."
    }
  }

  if (/where|when|status|track|arriv|late|delay|eta/.test(text)) {
    const eta = order.estimatedDelivery
    switch (situation) {
      case 'preparing':
        return `It's being packed right now. Tracking will appear once the carrier picks it up — usually within 1 business day. It's still expected ${eta ? formatWindow(eta, now) : 'on time'}.`
      case 'delayed':
        return `It's at the carrier's Memphis hub, held up by storms. The new estimate is ${eta ? formatWindow(eta, now) : 'still being confirmed'}. I've flagged it so we're alerted the moment it moves.`
      case 'in_transit':
      case 'out_for_delivery':
        return `It's on schedule! Current estimate: ${eta ? formatWindow(eta, now) : 'soon'}.`
      case 'not_received':
      case 'investigating':
        return "The carrier scanned it as delivered, but we know it isn't with you. We've asked them to check the GPS scan and driver notes, and we'll update you within 48 hours."
      default:
        return "It was delivered — you can see the time and the driver's photo on your tracking page."
    }
  }

  if (/address|instruction|door|gate|leave/.test(text)) {
    return situation === 'delivered' || situation === 'not_received' || situation === 'investigating'
      ? "This order has already been delivered, but I've saved that note to your account for future deliveries."
      : "Got it — I've passed your delivery instructions to the carrier. They'll apply to this delivery."
  }

  return "Thanks — I've added that to your order notes. A specialist will follow up by email within 24 hours, and you can keep chatting here in the meantime."
}
