import { ORDER_STAGES, type Order, type OrderStage, type TrackingEvent } from '../types/order'
import { formatDayAndTime, formatHeadlineDay, formatMonthDay, formatShortDate, formatWindow, toDate } from './format'

export type Situation =
  'preparing' | 'in_transit' | 'out_for_delivery' | 'delayed' | 'delivered' | 'not_received' | 'investigating'

export type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral'

export type StepState = 'complete' | 'current' | 'upcoming'

export interface ProgressStep {
  stage: OrderStage
  label: string
  state: StepState
  tone: Tone
  date?: string
}

export interface KeyDate {
  label: string
  value: string
  previous?: string
}

export interface TrackingSummary {
  situation: Situation
  tone: Tone
  badge: string
  headline: string
  detail: string
  keyDate: KeyDate | null
  isDelayed: boolean
  trackingAvailable: boolean
  steps: ProgressStep[]
  currentStepIndex: number
  progressLabel: string
  latestEvent: TrackingEvent | null
}

export const DELAY_GUARANTEE_DAYS = 2

export function sortEventsNewestFirst(events: TrackingEvent[]) {
  return [...events].sort((a, b) => toDate(b.timestamp).getTime() - toDate(a.timestamp).getTime())
}

export function isOrderDelayed(order: Order, now: Date) {
  if (order.stage === 'delivered') return false
  if (order.delay) return true
  return order.estimatedDelivery !== null && toDate(order.estimatedDelivery.end) < now
}

export function getSituation(order: Order, now: Date): Situation {
  if (order.stage === 'delivered') {
    if (order.supportCase?.type === 'not_received' && order.supportCase.status === 'open') {
      return 'investigating'
    }
    if (order.delivery?.receipt === 'not_received') return 'not_received'
    return 'delivered'
  }
  if (isOrderDelayed(order, now)) return 'delayed'
  if (order.stage === 'out_for_delivery') return 'out_for_delivery'
  if (order.stage === 'shipped') return 'in_transit'
  return 'preparing'
}

export const TONE_BY_SITUATION: Record<Situation, Tone> = {
  preparing: 'brand',
  in_transit: 'brand',
  out_for_delivery: 'brand',
  delayed: 'warning',
  delivered: 'success',
  not_received: 'warning',
  investigating: 'warning',
}

const BADGE_BY_SITUATION: Record<Situation, string> = {
  preparing: 'Preparing to ship',
  in_transit: 'On the way',
  out_for_delivery: 'Out for delivery',
  delayed: 'Delayed',
  delivered: 'Delivered',
  not_received: 'Not received',
  investigating: 'Investigating',
}

export function getDelayGuaranteeDate(order: Order) {
  const base = order.estimatedDelivery?.end ?? order.delay?.originalEstimate.end ?? order.placedAt
  const date = toDate(base)
  date.setDate(date.getDate() + DELAY_GUARANTEE_DAYS)
  return date
}

function buildSteps(order: Order, situation: Situation): ProgressStep[] {
  const stageIndex = ORDER_STAGES.indexOf(order.stage)
  const reachedAt = new Map<OrderStage, string>()
  for (const event of sortEventsNewestFirst(order.events)) reachedAt.set(event.stage, event.timestamp)

  return ORDER_STAGES.map((stage, index) => {
    let state: StepState = 'upcoming'
    if (index < stageIndex || (index === stageIndex && stage === 'delivered')) state = 'complete'
    else if (index === stageIndex) state = 'current'

    let tone: Tone = state === 'upcoming' ? 'neutral' : 'brand'
    if (situation === 'delivered') tone = 'success'
    if (situation === 'delayed' && state === 'current') tone = 'warning'
    if ((situation === 'not_received' || situation === 'investigating') && stage === 'delivered') {
      tone = 'warning'
    }

    const labels: Record<OrderStage, string> = {
      processing: state === 'current' ? 'Preparing' : 'Confirmed',
      shipped: state === 'current' ? 'In transit' : 'Shipped',
      out_for_delivery: 'Out for delivery',
      delivered: situation === 'not_received' || situation === 'investigating' ? 'Marked delivered' : 'Delivered',
    }
    let label = labels[stage]
    if (situation === 'delayed' && state === 'current') label = 'Delayed'

    const reached = reachedAt.get(stage)
    return {
      stage,
      label,
      state,
      tone,
      date: state !== 'upcoming' && reached ? formatMonthDay(reached) : undefined,
    }
  })
}

export function summarizeTracking(order: Order, now: Date = new Date()): TrackingSummary {
  const situation = getSituation(order, now)
  const tone = TONE_BY_SITUATION[situation]
  const eta = order.estimatedDelivery
  const events = sortEventsNewestFirst(order.events)
  const steps = buildSteps(order, situation)
  const currentStepIndex = ORDER_STAGES.indexOf(order.stage)
  const carrier = order.shipment?.carrier ?? 'the carrier'

  let headline: string
  let detail: string
  let keyDate: KeyDate | null = null

  switch (situation) {
    case 'preparing':
      headline = 'Getting your order ready'
      detail = 'The seller is packing your items. Tracking starts as soon as it ships.'
      keyDate = eta ? { label: 'Estimated delivery', value: formatWindow(eta, now) } : null
      break

    case 'in_transit':
      headline = eta ? `Arriving ${formatHeadlineDay(eta.end, now)}` : 'On its way to you'
      detail = `Your package is with ${carrier} and moving toward you.`
      keyDate = eta ? { label: 'Estimated delivery', value: formatWindow(eta, now) } : null
      break

    case 'out_for_delivery': {
      headline = eta ? `Arriving ${formatHeadlineDay(eta.end, now)}` : 'Arriving today'
      const stops = order.shipment?.stopsAway
      detail =
        stops !== undefined
          ? `It's on the delivery vehicle — ${stops} ${stops === 1 ? 'stop' : 'stops'} away.`
          : "It's on the delivery vehicle and will arrive soon."
      keyDate = eta ? { label: 'Delivery window', value: formatWindow(eta, now) } : null
      break
    }

    case 'delayed': {
      const original = order.delay?.originalEstimate
      const hasNewEstimate = eta !== null && toDate(eta.end) >= now
      headline = hasNewEstimate ? `Now arriving ${formatHeadlineDay(eta.end, now)}` : 'Running late'
      detail = order.delay?.summary ?? "It's taking longer than expected. We've asked the carrier for an update."
      keyDate = {
        label: hasNewEstimate ? 'New estimated delivery' : 'Estimated delivery',
        value: hasNewEstimate ? formatWindow(eta, now) : 'Waiting on a new estimate',
        previous: original
          ? formatShortDate(original.end)
          : eta && !hasNewEstimate
            ? formatShortDate(eta.end)
            : undefined,
      }
      break
    }

    case 'delivered': {
      const deliveredAt = order.delivery?.deliveredAt ?? events[0]?.timestamp ?? now.toISOString()
      headline = `Delivered ${formatHeadlineDay(deliveredAt, now)}`
      detail = order.delivery ? `Left at the ${order.delivery.location.toLowerCase()}. Enjoy!` : 'Enjoy your order!'
      keyDate = { label: 'Delivered', value: formatDayAndTime(deliveredAt, now) }
      break
    }

    case 'not_received': {
      const deliveredAt = order.delivery?.deliveredAt ?? now.toISOString()
      headline = "Let's find your package"
      detail = `${carrier} marked it delivered, but you told us it hasn't arrived. Here's what to do next.`
      keyDate = { label: 'Marked delivered', value: formatDayAndTime(deliveredAt, now) }
      break
    }

    case 'investigating': {
      const supportCase = order.supportCase!
      headline = "We're looking into it"
      detail = `Missing package case #${supportCase.id} is open. You don't need to do anything else right now.`
      keyDate = { label: 'Next update by', value: formatShortDate(supportCase.respondBy) }
      break
    }
  }

  const current = steps[currentStepIndex]
  return {
    situation,
    tone,
    badge: BADGE_BY_SITUATION[situation],
    headline,
    detail,
    keyDate,
    isDelayed: situation === 'delayed',
    trackingAvailable: order.shipment !== null,
    steps,
    currentStepIndex,
    progressLabel: `Step ${currentStepIndex + 1} of ${steps.length}: ${current.label}`,
    latestEvent: events[0] ?? null,
  }
}
