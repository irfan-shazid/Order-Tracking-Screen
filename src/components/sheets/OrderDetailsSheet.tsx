import { Copy, CreditCard, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatDayAndTime, formatFullDate, formatMoney, itemCount, pluralize } from '../../lib/format'
import type { Order } from '../../types/order'
import { ProductThumb } from '../tracking/ProductThumb'
import { IconButton } from '../ui/Button'
import { Sheet, SheetBody, SheetHeader } from '../ui/Sheet'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-100 py-4 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">{title}</h3>
      {children}
    </section>
  )
}

function PriceRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={
        strong
          ? 'flex justify-between pt-2 text-[15px] font-semibold text-slate-900'
          : 'flex justify-between text-sm text-slate-600'
      }
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

interface OrderDetailsSheetProps {
  open: boolean
  onClose: () => void
  order: Order
  now: Date
  onCopy: (value: string, label: string) => void
}

export function OrderDetailsSheet({ open, onClose, order, now, onCopy }: OrderDetailsSheetProps) {
  const money = (n: number) => formatMoney(n, order.currency)
  const { pricing, address } = order

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHeader title="Order details" description={`Placed ${formatDayAndTime(order.placedAt, now)}`} />
      <SheetBody>
        <Section title="Order number">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200/70">
            <span className="font-mono text-sm font-semibold text-slate-900">#{order.number}</span>
            <IconButton
              label="Copy order number"
              onClick={() => onCopy(order.number, 'Order number')}
              className="size-9"
            >
              <Copy className="size-4" aria-hidden />
            </IconButton>
          </div>
        </Section>

        <Section title={pluralize(itemCount(order), 'item')}>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <ProductThumb art={item.art} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.variant}</p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} × {money(item.unitPrice)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium text-slate-900">{money(item.unitPrice * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Payment">
          <dl className="space-y-1.5">
            <PriceRow label="Subtotal" value={money(pricing.subtotal)} />
            {pricing.discount > 0 && <PriceRow label="Discount" value={`−${money(pricing.discount)}`} />}
            <PriceRow label="Shipping" value={pricing.shipping === 0 ? 'Free' : money(pricing.shipping)} />
            <PriceRow label="Tax" value={money(pricing.tax)} />
            <PriceRow label="Total" value={money(pricing.total)} strong />
          </dl>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <CreditCard className="size-4 text-slate-400" aria-hidden />
            Paid with {order.payment.brand} •••• {order.payment.last4} on {formatFullDate(order.placedAt)}
          </p>
        </Section>

        <Section title="Shipping address">
          <p className="flex gap-2 text-sm leading-relaxed text-slate-700">
            <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
            <span>
              {address.name}
              <br />
              {address.line1}
              {address.line2 && `, ${address.line2}`}
              <br />
              {address.city}, {address.region} {address.postalCode}
              <br />
              {address.phone}
            </span>
          </p>
        </Section>
      </SheetBody>
    </Sheet>
  )
}
