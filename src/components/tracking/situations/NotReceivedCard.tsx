import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../../lib/ui'
import type { Order } from '../../../types/order'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { PhotoRow } from './PhotoRow'

const CHECKS = [
  'Look around your door, porch, mailbox and any hidden spots',
  'Ask neighbors or your building’s front desk or mail room',
  'Check the delivery photo. Is that your door?',
  'Look for a delivery notice from the carrier',
]

interface NotReceivedCardProps {
  order: Order
  now: Date
  pending: boolean
  onReport: () => void
  onFound: () => void
  onViewPhoto: () => void
}

export function NotReceivedCard({ order, now, pending, onReport, onFound, onViewPhoto }: NotReceivedCardProps) {
  const [checked, setChecked] = useState<boolean[]>(() => CHECKS.map(() => false))
  const done = checked.filter(Boolean).length

  return (
    <Card className="p-4 ring-amber-200" aria-labelledby="not-received-title">
      <div className="flex items-baseline justify-between gap-2">
        <h3 id="not-received-title" className="text-[15px] font-semibold text-slate-900">
          Quick checks before reporting
        </h3>
        <span className="shrink-0 text-xs font-medium text-slate-500" aria-live="polite">
          {done} of {CHECKS.length} done
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Packages marked delivered often turn up within a day. These take a minute and are optional.
      </p>

      <ul className="mt-3 space-y-1">
        {CHECKS.map((label, index) => (
          <li key={label}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg px-1 py-2 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={() => setChecked((c) => c.map((v, i) => (i === index ? !v : v)))}
                className="mt-0.5 size-[18px] shrink-0 cursor-pointer rounded accent-brand-600"
              />
              <span className={cn('text-sm', checked[index] ? 'text-slate-500 line-through' : 'text-slate-700')}>
                {label}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-3">
        <PhotoRow order={order} now={now} onView={onViewPhoto} />
      </div>

      <div className="mt-4 space-y-2">
        <Button block onClick={onReport} variant="primary">
          Report missing package
        </Button>
        <Button block variant="ghost" onClick={onFound} loading={pending}>
          I found it
        </Button>
      </div>

      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <ShieldCheck className="size-4 shrink-0 text-emerald-600" aria-hidden />
        You're covered. If it's lost, we'll send a replacement or refund you in full.
      </p>
    </Card>
  )
}
