export type OrderStage = 'processing' | 'shipped' | 'out_for_delivery' | 'delivered'

export const ORDER_STAGES: readonly OrderStage[] = ['processing', 'shipped', 'out_for_delivery', 'delivered']

export interface DateWindow {
  start: string
  end: string
}

export type ProductArt =
  'headphones' | 'cable' | 'coffee' | 'beans' | 'shoe' | 'socks' | 'lamp' | 'organizer' | 'watch' | 'tote' | 'pillow'

export interface OrderItem {
  id: string
  name: string
  variant: string
  quantity: number
  unitPrice: number
  art: ProductArt
}

export interface Address {
  name: string
  line1: string
  line2?: string
  city: string
  region: string
  postalCode: string
  phone: string
}

export interface TrackingEvent {
  id: string
  timestamp: string
  title: string
  description?: string
  location?: string
  stage: OrderStage
  exception?: boolean
}

export interface Shipment {
  carrier: string
  service: string
  trackingNumber: string
  stopsAway?: number
}

export interface DelayInfo {
  summary: string
  reason: string
  originalEstimate: DateWindow
  updatedAt: string
}

export type ReceiptStatus = 'unconfirmed' | 'confirmed' | 'not_received'

export interface DeliveryInfo {
  deliveredAt: string
  location: string
  hasPhoto: boolean
  receipt: ReceiptStatus
}

export type IssueType = 'not_received' | 'late' | 'damaged' | 'wrong_item' | 'other'

export type Resolution = 'replacement' | 'refund'

export interface SupportCase {
  id: string
  type: IssueType
  status: 'open' | 'closed'
  openedAt: string
  respondBy: string
  resolution?: Resolution
  details?: string
}

export interface Pricing {
  subtotal: number
  shipping: number
  discount: number
  tax: number
  total: number
}

export interface Order {
  id: string
  number: string
  placedAt: string
  stage: OrderStage
  customer: { name: string; email: string }
  items: OrderItem[]
  pricing: Pricing
  currency: string
  payment: { brand: string; last4: string }
  address: Address
  deliveryInstructions?: string
  estimatedDelivery: DateWindow | null
  delay?: DelayInfo
  shipment: Shipment | null
  events: TrackingEvent[]
  delivery?: DeliveryInfo
  supportCase?: SupportCase
  alertsEnabled: boolean
  lastSyncedAt: string
}

export interface ReportIssueInput {
  type: IssueType
  resolution?: Resolution
  details?: string
}
