import { Receipt } from 'lucide-react'
import { formatFullDate, formatMoney, itemCount, pluralize } from '../../lib/format'
import type { Order } from '../../types/order'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'
import { ProductThumb } from './ProductThumb'

export function OrderSummaryCard({ order, onViewDetails }: { order: Order; onViewDetails: () => void }) {
  return (
    <Card aria-labelledby="summary-title">
      <CardHeader
        id="summary-title"
        title="Order summary"
        subtitle={`${pluralize(itemCount(order), 'item')} · Placed ${formatFullDate(order.placedAt)}`}
      />
      <ul className="space-y-3 px-4 pt-4">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <ProductThumb art={item.art} />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm leading-snug font-semibold text-slate-900">{item.name}</p>
              <p className="truncate text-xs text-slate-500">
                {item.variant} · Qty {item.quantity}
              </p>
            </div>
            <p className="shrink-0 text-sm font-medium text-slate-900">
              {formatMoney(item.unitPrice * item.quantity, order.currency)}
            </p>
          </li>
        ))}
      </ul>
      <div className="mx-4 mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm text-slate-600">Order total</span>
        <span className="text-[15px] font-semibold text-slate-900">
          {formatMoney(order.pricing.total, order.currency)}
        </span>
      </div>
      <div className="p-4 pt-3">
        <Button variant="outline" block onClick={onViewDetails} icon={<Receipt className="size-4" aria-hidden />}>
          View order details
        </Button>
      </div>
    </Card>
  )
}
