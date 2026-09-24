import { ChevronDown, Hourglass } from 'lucide-react'
import { useId, useState } from 'react'
import { formatDayLabel, formatTime } from '../../lib/format'
import { sortEventsNewestFirst, type Tone } from '../../lib/tracking'
import { cn, toneClasses } from '../../lib/ui'
import type { Order } from '../../types/order'
import { Card, CardHeader } from '../ui/Card'

const COLLAPSED_COUNT = 3

interface TrackingHistoryProps {
  order: Order
  tone: Tone
  now: Date
}

export function TrackingHistory({ order, tone, now }: TrackingHistoryProps) {
  const [expanded, setExpanded] = useState(false)
  const listId = useId()
  const events = sortEventsNewestFirst(order.events)
  const visible = expanded ? events : events.slice(0, COLLAPSED_COUNT)
  const hidden = events.length - COLLAPSED_COUNT
  const awaitingCarrier = order.shipment === null

  return (
    <Card aria-labelledby="history-title">
      <CardHeader
        id="history-title"
        title="Tracking history"
        subtitle={order.shipment ? `${order.shipment.service} updates` : 'Store updates so far'}
      />

      <ol id={listId} className="px-4 pt-4 pb-4">
        {awaitingCarrier && (
          <li className="relative flex gap-3 pb-5">
            <span aria-hidden className="absolute top-6 left-[9px] h-[calc(100%-1.25rem)] w-0.5 bg-slate-200" />
            <span
              aria-hidden
              className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-white"
            />
            <div className="flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <Hourglass className="size-3.5 text-slate-500" aria-hidden />
                Waiting for carrier pickup
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Carrier scans and locations will show up here once your package ships.
              </p>
            </div>
          </li>
        )}

        {visible.map((event, index) => {
          const isLatest = index === 0 && !awaitingCarrier
          const isLast = index === visible.length - 1
          return (
            <li key={event.id} className={cn('relative flex gap-3', !isLast && 'pb-5')}>
              {!isLast && (
                <span aria-hidden className="absolute top-6 left-[9px] h-[calc(100%-1.25rem)] w-0.5 bg-slate-200" />
              )}
              <span aria-hidden className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
                <span
                  className={cn(
                    'rounded-full',
                    isLatest || event.exception ? 'size-3.5 ring-4' : 'size-2.5',
                    event.exception
                      ? 'bg-amber-500 ring-amber-100'
                      : isLatest
                        ? cn(toneClasses[tone].dot, toneClasses[tone].ring)
                        : 'bg-slate-300',
                  )}
                />
              </span>
              <div className="-mt-px min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    event.exception ? 'text-amber-800' : isLatest ? 'text-slate-900' : 'text-slate-700',
                  )}
                >
                  {event.title}
                  {isLatest && <span className="sr-only"> (latest update)</span>}
                </p>
                {event.description && (
                  <p className="mt-0.5 text-[13px] leading-snug text-slate-600">{event.description}</p>
                )}
                <p className="mt-0.5 text-xs text-slate-500">
                  {event.location && <>{event.location} · </>}
                  <time dateTime={event.timestamp}>
                    {formatDayLabel(event.timestamp, now)}, {formatTime(event.timestamp)}
                  </time>
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={listId}
          className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-slate-50"
        >
          {expanded ? 'Show fewer updates' : `Show ${hidden} earlier ${hidden === 1 ? 'update' : 'updates'}`}
          <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} aria-hidden />
        </button>
      )}
    </Card>
  )
}
