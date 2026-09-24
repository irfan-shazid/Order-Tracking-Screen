export type ScenarioId =
  | 'delayed'
  | 'not-received'
  | 'tracking-pending'
  | 'in-transit'
  | 'out-for-delivery'
  | 'delivered'
  | 'slow-network'
  | 'load-error'
  | 'not-found'

export type ScenarioGroup = 'Required scenarios' | 'Standard journey' | 'System states'

export interface Scenario {
  id: ScenarioId
  label: string
  description: string
  group: ScenarioGroup
  orderNumber: string
  latencyMs?: number
  failFirstAttempt?: boolean
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'delayed',
    label: 'Delayed order',
    description: 'Estimate has passed. Shows the reason, the new date and next steps.',
    group: 'Required scenarios',
    orderNumber: 'VS-19102',
  },
  {
    id: 'not-received',
    label: 'Delivered, not received',
    description: 'Carrier says delivered, customer can’t find it. Report and resolve.',
    group: 'Required scenarios',
    orderNumber: 'VS-19640',
  },
  {
    id: 'tracking-pending',
    label: 'Tracking not available yet',
    description: 'Order exists but hasn’t shipped. Explains what happens next.',
    group: 'Required scenarios',
    orderNumber: 'VS-20671',
  },
  {
    id: 'in-transit',
    label: 'On the way',
    description: 'Shipped and moving through the carrier network.',
    group: 'Standard journey',
    orderNumber: 'VS-20418',
  },
  {
    id: 'out-for-delivery',
    label: 'Out for delivery',
    description: 'On the delivery vehicle with a same-day window.',
    group: 'Standard journey',
    orderNumber: 'VS-20533',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    description: 'Delivered with photo proof. Asks the customer to confirm receipt.',
    group: 'Standard journey',
    orderNumber: 'VS-19877',
  },
  {
    id: 'slow-network',
    label: 'Loading (slow network)',
    description: 'Skeleton screen while tracking loads (about 4 seconds).',
    group: 'System states',
    orderNumber: 'VS-20418',
    latencyMs: 4000,
  },
  {
    id: 'load-error',
    label: 'Error, then retry',
    description: 'The first request fails. “Try again” recovers.',
    group: 'System states',
    orderNumber: 'VS-20418',
    failFirstAttempt: true,
  },
  {
    id: 'not-found',
    label: 'Order not found',
    description: 'Empty state with an order-number search.',
    group: 'System states',
    orderNumber: 'VS-00000',
  },
]

export const DEFAULT_SCENARIO_ID: ScenarioId = 'in-transit'

export const SCENARIO_GROUPS: ScenarioGroup[] = ['Required scenarios', 'Standard journey', 'System states']

export function isScenarioId(value: string | null): value is ScenarioId {
  return SCENARIOS.some((s) => s.id === value)
}

export function getScenario(id: ScenarioId) {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0]
}
