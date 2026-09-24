import { Check, MessageCircle } from 'lucide-react'
import { formatDayAndTime, formatMoney, formatShortDate } from '../../../lib/format'
import { cn } from '../../../lib/ui'
import type { Order, SupportCase } from '../../../types/order'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'

interface InvestigationCardProps {
  order: Order
  supportCase: SupportCase
  now: Date
  pending: boolean
  onChat: () => void
  onFound: () => void
}

export function InvestigationCard({ order, supportCase, now, pending, onChat, onFound }: InvestigationCardProps) {
  const outcome =
    supportCase.resolution === 'refund'
      ? `Refund of ${formatMoney(order.pricing.total, order.currency)} to ${order.payment.brand} •••• ${order.payment.last4}`
      : 'Free replacement ships'
  const steps = [
    { title: 'Report received', detail: formatDayAndTime(supportCase.openedAt, now), state: 'complete' as const },
    { title: 'Carrier investigation', detail: 'Checking the GPS scan and driver notes', state: 'current' as const },
    {
      title: outcome,
      detail: `By ${formatShortDate(supportCase.respondBy)} if it hasn't turned up`,
      state: 'upcoming' as const,
    },
  ]

  return (
    <Card className="p-4" aria-labelledby="case-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Case #{supportCase.id}</p>
          <h3 id="case-title" className="text-[15px] font-semibold text-slate-900">
            Missing package report
          </h3>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Open</span>
      </div>

      <ol className="mt-4">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-3 pb-4 last:pb-0">
            {index < steps.length - 1 && (
              <span aria-hidden className="absolute top-6 left-[9px] h-[calc(100%-1.25rem)] w-0.5 bg-slate-200" />
            )}
            <span
              aria-hidden
              className={cn(
                'relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                step.state === 'complete' && 'bg-brand-600 text-white',
                step.state === 'current' && 'bg-amber-100 ring-2 ring-amber-500',
                step.state === 'upcoming' && 'border-2 border-slate-300 bg-white',
              )}
            >
              {step.state === 'complete' && <Check className="size-3" strokeWidth={3} />}
              {step.state === 'current' && <span className="size-2 rounded-full bg-amber-500" />}
            </span>
            <div>
              <p className={cn('text-sm font-medium', step.state === 'upcoming' ? 'text-slate-600' : 'text-slate-900')}>
                {step.title}
                <span className="sr-only">
                  {step.state === 'complete' ? ' (done)' : step.state === 'current' ? ' (in progress)' : ' (upcoming)'}
                </span>
              </p>
              <p className="text-xs text-slate-500">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onChat} icon={<MessageCircle className="size-4" aria-hidden />}>
          Chat with us
        </Button>
        <Button variant="secondary" onClick={onFound} loading={pending}>
          I found it
        </Button>
      </div>
    </Card>
  )
}
