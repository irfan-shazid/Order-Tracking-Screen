import {
  CalendarClock,
  Clock,
  MapPin,
  PackageCheck,
  PackageOpen,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import type { Ref } from 'react'
import { formatRelative } from '../../lib/format'
import type { Situation, TrackingSummary } from '../../lib/tracking'
import { cn, toneClasses } from '../../lib/ui'
import { Card } from '../ui/Card'
import { ProgressStepper } from './ProgressStepper'

const BADGE_ICONS: Record<Situation, LucideIcon> = {
  preparing: PackageOpen,
  in_transit: Truck,
  out_for_delivery: MapPin,
  delayed: Clock,
  delivered: PackageCheck,
  not_received: PackageSearch,
  investigating: ShieldCheck,
}

interface StatusHeroProps {
  summary: TrackingSummary
  lastSyncedAt: string
  now: Date
  refreshing: boolean
  onRefresh: () => void
  headingRef?: Ref<HTMLHeadingElement>
}

export function StatusHero({ summary, lastSyncedAt, now, refreshing, onRefresh, headingRef }: StatusHeroProps) {
  const tone = toneClasses[summary.tone]
  const BadgeIcon = BADGE_ICONS[summary.situation]

  return (
    <Card className="overflow-hidden" aria-labelledby="status-headline">
      <div className={cn('bg-linear-to-b px-4 pt-4 pb-4', tone.gradient)}>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', tone.soft)}
          >
            <BadgeIcon className="size-3.5" strokeWidth={2.5} aria-hidden />
            {summary.badge}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="-mr-1.5 inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-xs text-slate-500 transition-colors hover:bg-white hover:text-slate-800 disabled:opacity-70"
            aria-label={
              refreshing ? 'Refreshing tracking' : `Updated ${formatRelative(lastSyncedAt, now)}. Refresh tracking`
            }
          >
            <span aria-hidden>{refreshing ? 'Refreshing…' : `Updated ${formatRelative(lastSyncedAt, now)}`}</span>
            <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} aria-hidden />
          </button>
        </div>

        <h2
          id="status-headline"
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 text-[26px] leading-[1.15] font-bold tracking-tight text-slate-900 outline-none"
        >
          {summary.headline}
        </h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{summary.detail}</p>

        {summary.keyDate && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/90 p-3 ring-1 ring-slate-200/80">
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', tone.soft)}>
              <CalendarClock className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">{summary.keyDate.label}</p>
              <p className="text-[15px] font-semibold text-slate-900">{summary.keyDate.value}</p>
              {summary.keyDate.previous && (
                <p className="text-xs text-slate-500">
                  Originally <s className="decoration-slate-400">{summary.keyDate.previous}</s>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 px-2 pt-5 pb-4">
        <ProgressStepper steps={summary.steps} label={summary.progressLabel} />
      </div>
    </Card>
  )
}
