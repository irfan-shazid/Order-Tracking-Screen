import { Check, ClipboardCheck, House, MapPin, TriangleAlert, Truck, type LucideIcon } from 'lucide-react'
import type { ProgressStep } from '../../lib/tracking'
import { cn, toneClasses } from '../../lib/ui'
import type { OrderStage } from '../../types/order'

const STAGE_ICONS: Record<OrderStage, LucideIcon> = {
  processing: ClipboardCheck,
  shipped: Truck,
  out_for_delivery: MapPin,
  delivered: House,
}

const STATE_TEXT = { complete: 'completed', current: 'current step', upcoming: 'not started' } as const

export function ProgressStepper({ steps, label }: { steps: ProgressStep[]; label: string }) {
  return (
    <div>
      <p className="sr-only">{label}</p>
      <ol className="grid grid-cols-4" aria-label="Delivery progress">
        {steps.map((step, index) => {
          const tone = toneClasses[step.tone]
          const reached = step.state !== 'upcoming'
          const Icon =
            step.tone === 'warning' ? TriangleAlert : step.state === 'complete' ? Check : STAGE_ICONS[step.stage]

          return (
            <li
              key={step.stage}
              className="relative flex flex-col items-center px-0.5 text-center"
              aria-current={step.state === 'current' ? 'step' : undefined}
            >
              {index > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-4 right-1/2 h-[3px] w-full -translate-y-1/2 rounded-full',
                    reached ? tone.dot : 'bg-slate-200',
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex size-8 items-center justify-center rounded-full ring-4 ring-white',
                  step.state === 'complete' && tone.solid,
                  step.state === 'current' && tone.soft,
                  step.state === 'upcoming' && 'bg-slate-100 text-slate-400',
                )}
              >
                {step.state === 'current' && (
                  <span
                    aria-hidden
                    className={cn('absolute inset-0 animate-pulse-ring rounded-full', tone.dot, 'opacity-30')}
                  />
                )}
                <Icon className="relative size-4" strokeWidth={2.5} aria-hidden />
              </span>
              <span
                className={cn(
                  'mt-2 text-[11px] leading-tight font-semibold',
                  step.state === 'upcoming'
                    ? 'text-slate-500'
                    : step.state === 'current'
                      ? tone.text
                      : 'text-slate-800',
                )}
              >
                {step.label}
              </span>
              <span className="mt-0.5 text-[11px] leading-tight text-slate-500">{step.date ?? ' '}</span>
              <span className="sr-only">, {STATE_TEXT[step.state]}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
