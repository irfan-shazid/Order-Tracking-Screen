import type { Address, Order, OrderItem, Pricing } from '../types/order'

const HOUR = 3_600_000
const TAX_RATE = 0.0825

export const DEMO_CUSTOMER = { name: 'Alex Morgan', email: 'alex.morgan@example.com' }

const ADDRESS: Address = {
  name: 'Alex Morgan',
  line1: '2145 Maple Avenue',
  line2: 'Apt 4B',
  city: 'Austin',
  region: 'TX',
  postalCode: '78704',
  phone: '(512) 555-0147',
}

const round2 = (n: number) => Math.round(n * 100) / 100

function priceOrder(items: OrderItem[], shipping: number, discount = 0): Pricing {
  const subtotal = round2(items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0))
  const tax = round2((subtotal - discount) * TAX_RATE)
  return { subtotal, shipping, discount, tax, total: round2(subtotal - discount + shipping + tax) }
}

export function createSeedOrders(now: Date = new Date()): Order[] {
  const ago = (hours: number) => new Date(now.getTime() - hours * HOUR).toISOString()
  const dayAt = (offsetDays: number, hour: number, minute = 0) => {
    const d = new Date(now)
    d.setDate(d.getDate() + offsetDays)
    d.setHours(hour, minute, 0, 0)
    return d.toISOString()
  }
  const window = (offsetDays: number, fromHour: number, toHour: number) => ({
    start: dayAt(offsetDays, fromHour),
    end: dayAt(offsetDays, toHour),
  })

  const nextHour = new Date(now)
  nextHour.setMinutes(0, 0, 0)
  nextHour.setHours(nextHour.getHours() + 1)
  const todayWindow = {
    start: new Date(nextHour.getTime() - HOUR).toISOString(),
    end: new Date(nextHour.getTime() + 3 * HOUR).toISOString(),
  }

  const base = {
    customer: DEMO_CUSTOMER,
    currency: 'USD',
    payment: { brand: 'Visa', last4: '4242' },
    address: ADDRESS,
    deliveryInstructions: 'Leave at the front door if no one answers.',
    alertsEnabled: false,
    lastSyncedAt: now.toISOString(),
  }

  const inTransitItems: OrderItem[] = [
    {
      id: 'it-1',
      name: 'Aura ANC Wireless Headphones',
      variant: 'Midnight Black',
      quantity: 1,
      unitPrice: 199,
      art: 'headphones',
    },
    { id: 'it-2', name: 'Braided USB-C Cable, 2 m', variant: 'Graphite', quantity: 2, unitPrice: 14.5, art: 'cable' },
  ]
  const outForDeliveryItems: OrderItem[] = [
    { id: 'od-1', name: 'Terra Ceramic Pour-Over Set', variant: 'Sand', quantity: 1, unitPrice: 64, art: 'coffee' },
    {
      id: 'od-2',
      name: 'Single-Origin Coffee Beans, 340 g',
      variant: 'Ethiopia · Light roast',
      quantity: 2,
      unitPrice: 18,
      art: 'beans',
    },
  ]
  const deliveredItems: OrderItem[] = [
    {
      id: 'dl-1',
      name: 'Nimbus Running Shoes',
      variant: 'Glacier Blue · US 10',
      quantity: 1,
      unitPrice: 129,
      art: 'shoe',
    },
    {
      id: 'dl-2',
      name: 'Performance Crew Socks, 3-pack',
      variant: 'White · M',
      quantity: 1,
      unitPrice: 18,
      art: 'socks',
    },
  ]
  const delayedItems: OrderItem[] = [
    { id: 'dy-1', name: 'Lumen Smart Desk Lamp', variant: 'Matte White', quantity: 1, unitPrice: 89, art: 'lamp' },
    { id: 'dy-2', name: 'Bamboo Desk Organizer', variant: 'Natural', quantity: 1, unitPrice: 32, art: 'organizer' },
  ]
  const notReceivedItems: OrderItem[] = [
    {
      id: 'nr-1',
      name: 'Pulse GPS Fitness Watch',
      variant: 'Graphite · 44 mm',
      quantity: 1,
      unitPrice: 249,
      art: 'watch',
    },
  ]
  const pendingItems: OrderItem[] = [
    { id: 'tp-1', name: 'Everyday Canvas Tote', variant: 'Olive', quantity: 1, unitPrice: 48, art: 'tote' },
    {
      id: 'tp-2',
      name: 'Linen Throw Pillow Cover',
      variant: 'Oat · 20 × 20 in',
      quantity: 2,
      unitPrice: 24,
      art: 'pillow',
    },
  ]

  return [
    {
      ...base,
      id: 'ord_20418',
      number: 'VS-20418',
      placedAt: ago(50),
      stage: 'shipped',
      items: inTransitItems,
      pricing: priceOrder(inTransitItems, 0),
      estimatedDelivery: window(2, 9, 20),
      shipment: { carrier: 'UPS', service: 'UPS Ground', trackingNumber: '1Z84A2E90312345678' },
      events: [
        {
          id: 'e1',
          timestamp: ago(50),
          stage: 'processing',
          title: 'Order placed',
          description: "We've received your order.",
        },
        { id: 'e2', timestamp: ago(49.8), stage: 'processing', title: 'Payment confirmed' },
        {
          id: 'e3',
          timestamp: ago(30),
          stage: 'processing',
          title: 'Packed and ready to ship',
          location: 'Fulfillment center · Reno, NV',
        },
        { id: 'e4', timestamp: ago(26), stage: 'shipped', title: 'Picked up by UPS', location: 'Reno, NV' },
        {
          id: 'e5',
          timestamp: ago(15),
          stage: 'shipped',
          title: 'Departed carrier facility',
          location: 'Salt Lake City, UT',
        },
        {
          id: 'e6',
          timestamp: ago(3),
          stage: 'shipped',
          title: 'Arrived at carrier facility',
          description: 'On schedule for delivery.',
          location: 'Denver, CO',
        },
      ],
    },

    {
      ...base,
      id: 'ord_20533',
      number: 'VS-20533',
      placedAt: ago(70),
      stage: 'out_for_delivery',
      items: outForDeliveryItems,
      pricing: priceOrder(outForDeliveryItems, 5.99),
      estimatedDelivery: todayWindow,
      shipment: { carrier: 'FedEx', service: 'FedEx Home Delivery', trackingNumber: '771948230056', stopsAway: 6 },
      events: [
        {
          id: 'e1',
          timestamp: ago(70),
          stage: 'processing',
          title: 'Order placed',
          description: "We've received your order.",
        },
        { id: 'e2', timestamp: ago(69.9), stage: 'processing', title: 'Payment confirmed' },
        {
          id: 'e3',
          timestamp: ago(52),
          stage: 'processing',
          title: 'Packed and ready to ship',
          location: 'Fulfillment center · Dallas, TX',
        },
        { id: 'e4', timestamp: ago(47), stage: 'shipped', title: 'Picked up by FedEx', location: 'Dallas, TX' },
        {
          id: 'e5',
          timestamp: ago(20),
          stage: 'shipped',
          title: 'Arrived at local delivery station',
          location: 'Austin, TX',
        },
        {
          id: 'e6',
          timestamp: ago(2),
          stage: 'out_for_delivery',
          title: 'Out for delivery',
          description: 'Your package is on the delivery vehicle.',
          location: 'Austin, TX',
        },
      ],
    },

    {
      ...base,
      id: 'ord_19877',
      number: 'VS-19877',
      placedAt: ago(96),
      stage: 'delivered',
      items: deliveredItems,
      pricing: priceOrder(deliveredItems, 0, 14.7),
      estimatedDelivery: window(0, 9, 20),
      shipment: { carrier: 'USPS', service: 'USPS Priority Mail', trackingNumber: '9405511899561234567890' },
      delivery: { deliveredAt: ago(2), location: 'Front door', hasPhoto: true, receipt: 'unconfirmed' },
      events: [
        {
          id: 'e1',
          timestamp: ago(96),
          stage: 'processing',
          title: 'Order placed',
          description: "We've received your order.",
        },
        { id: 'e2', timestamp: ago(95.9), stage: 'processing', title: 'Payment confirmed' },
        {
          id: 'e3',
          timestamp: ago(74),
          stage: 'processing',
          title: 'Packed and ready to ship',
          location: 'Fulfillment center · Phoenix, AZ',
        },
        { id: 'e4', timestamp: ago(70), stage: 'shipped', title: 'Accepted by USPS', location: 'Phoenix, AZ' },
        {
          id: 'e5',
          timestamp: ago(30),
          stage: 'shipped',
          title: 'Arrived at post office',
          location: 'Austin, TX 78704',
        },
        { id: 'e6', timestamp: ago(6), stage: 'out_for_delivery', title: 'Out for delivery', location: 'Austin, TX' },
        {
          id: 'e7',
          timestamp: ago(2),
          stage: 'delivered',
          title: 'Delivered',
          description: 'Left at front door. Photo taken by driver.',
          location: 'Austin, TX',
        },
      ],
    },

    {
      ...base,
      id: 'ord_19102',
      number: 'VS-19102',
      placedAt: ago(24 * 7),
      stage: 'shipped',
      items: delayedItems,
      pricing: priceOrder(delayedItems, 5.99),
      estimatedDelivery: window(1, 9, 20),
      delay: {
        summary: "Severe storms slowed the carrier's Memphis hub. Sorry for the wait.",
        reason:
          "Severe storms slowed operations at UPS's Memphis, TN hub, where your package is waiting for its next truck. It's safe, and UPS has given us a new delivery estimate.",
        originalEstimate: window(-2, 9, 20),
        updatedAt: ago(5),
      },
      shipment: { carrier: 'UPS', service: 'UPS Ground', trackingNumber: '1Z29F7W40398765432' },
      events: [
        {
          id: 'e1',
          timestamp: ago(24 * 7),
          stage: 'processing',
          title: 'Order placed',
          description: "We've received your order.",
        },
        { id: 'e2', timestamp: ago(24 * 7 - 0.1), stage: 'processing', title: 'Payment confirmed' },
        {
          id: 'e3',
          timestamp: ago(24 * 5.5),
          stage: 'processing',
          title: 'Packed and ready to ship',
          location: 'Fulfillment center · Columbus, OH',
        },
        { id: 'e4', timestamp: ago(24 * 5), stage: 'shipped', title: 'Picked up by UPS', location: 'Columbus, OH' },
        {
          id: 'e5',
          timestamp: ago(24 * 4),
          stage: 'shipped',
          title: 'Arrived at carrier facility',
          location: 'Memphis, TN',
        },
        {
          id: 'e6',
          timestamp: ago(24 * 3 + 4),
          stage: 'shipped',
          title: 'Weather delay',
          description: 'Severe storms are slowing operations at this facility.',
          location: 'Memphis, TN',
          exception: true,
        },
        {
          id: 'e7',
          timestamp: ago(5),
          stage: 'shipped',
          title: 'Delivery rescheduled',
          description: 'UPS has set a new estimated delivery date.',
          location: 'Memphis, TN',
          exception: true,
        },
      ],
    },

    {
      ...base,
      id: 'ord_19640',
      number: 'VS-19640',
      placedAt: ago(24 * 5),
      stage: 'delivered',
      items: notReceivedItems,
      pricing: priceOrder(notReceivedItems, 0),
      estimatedDelivery: window(-1, 9, 20),
      shipment: { carrier: 'USPS', service: 'USPS Priority Mail', trackingNumber: '9400111899223344556677' },
      delivery: { deliveredAt: dayAt(-1, 15, 14), location: 'Front door', hasPhoto: true, receipt: 'not_received' },
      events: [
        {
          id: 'e1',
          timestamp: ago(24 * 5),
          stage: 'processing',
          title: 'Order placed',
          description: "We've received your order.",
        },
        { id: 'e2', timestamp: ago(24 * 5 - 0.1), stage: 'processing', title: 'Payment confirmed' },
        {
          id: 'e3',
          timestamp: ago(24 * 4),
          stage: 'processing',
          title: 'Packed and ready to ship',
          location: 'Fulfillment center · Phoenix, AZ',
        },
        { id: 'e4', timestamp: ago(24 * 3.5), stage: 'shipped', title: 'Accepted by USPS', location: 'Phoenix, AZ' },
        {
          id: 'e5',
          timestamp: dayAt(-1, 5, 10),
          stage: 'shipped',
          title: 'Arrived at post office',
          location: 'Austin, TX 78704',
        },
        {
          id: 'e6',
          timestamp: dayAt(-1, 8, 52),
          stage: 'out_for_delivery',
          title: 'Out for delivery',
          location: 'Austin, TX',
        },
        {
          id: 'e7',
          timestamp: dayAt(-1, 15, 14),
          stage: 'delivered',
          title: 'Delivered',
          description: 'Left at front door. Photo taken by driver.',
          location: 'Austin, TX',
        },
      ],
    },

    {
      ...base,
      id: 'ord_20671',
      number: 'VS-20671',
      placedAt: ago(4),
      stage: 'processing',
      items: pendingItems,
      pricing: priceOrder(pendingItems, 0),
      estimatedDelivery: { start: dayAt(4, 9), end: dayAt(6, 20) },
      shipment: null,
      events: [
        {
          id: 'e1',
          timestamp: ago(4),
          stage: 'processing',
          title: 'Order placed',
          description: "We've received your order.",
        },
        { id: 'e2', timestamp: ago(3.9), stage: 'processing', title: 'Payment confirmed' },
        {
          id: 'e3',
          timestamp: ago(1),
          stage: 'processing',
          title: 'Preparing your order',
          description: 'The seller is picking and packing your items.',
        },
      ],
    },
  ]
}
