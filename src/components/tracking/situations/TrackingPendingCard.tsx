import { Check, ScanLine } from 'lucide-react'
import { formatDayAndTime } from '../../../lib/format'
import { cn } from '../../../lib/ui'
import type { Order } from '../../../types/order'
import { Card } from '../../ui/Card'
import { Switch } from '../../ui/Switch'
import { IconBubble } from './IconBubble'

interface TrackingPendingCardProps {
  order: Order
  now: Date
  onToggleAlerts: (enabled: boolean) => void
}

export function TrackingPendingCard({ order, now, onToggleAlerts }: TrackingPendingCardProps) {
  const expectations = [
    { title: 'Order confirmed', detail: formatDayAndTime(order.placedAt, now), done: true },
    { title: 'Packed and handed to the carrier', detail: 'Usually within 1 business day', done: false },
    { title: 'Live tracking starts', detail: 'Your tracking number appears here automatically', done: false },
  ]
  return (
    <Card className="p-4" aria-labelledby="pending-title">
      <div className="flex gap-3">
        <IconBubble className="bg-brand-50 text-brand-600">
          <ScanLine className="size-5" />
        </IconBubble>
        <div>
          <h3 id="pending-title" className="text-[15px] font-semibold text-slate-900">
            Tracking isn't available yet
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            That's normal for new orders. We'll add the carrier and tracking number as soon as your package ships.
          </p>
        </div>
      </div>

      <h4 className="mt-5 text-xs font-semibold tracking-wide text-slate-500 uppercase">What happens next</h4>
      <ol className="mt-3 space-y-3">
        {expectations.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <span
              className={cn(
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                item.done ? 'bg-brand-600 text-white' : 'border-2 border-dashed border-slate-300',
              )}
              aria-hidden
            >
              {item.done && <Check className="size-3" strokeWidth={3} />}
            </span>
            <div>
              <p className={cn('text-sm font-medium', item.done ? 'text-slate-900' : 'text-slate-700')}>
                {item.title}
                <span className="sr-only">{item.done ? ' (done)' : ' (upcoming)'}</span>
              </p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <Switch
          checked={order.alertsEnabled}
          onChange={onToggleAlerts}
          label="Notify me when it ships"
          description={`Text + email to ${order.address.phone} with your tracking link`}
        />
      </div>
    </Card>
  )
}
