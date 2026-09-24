import { MessageCircle, ShieldCheck, TriangleAlert } from 'lucide-react'
import { formatRelative, formatShortDate } from '../../../lib/format'
import { getDelayGuaranteeDate } from '../../../lib/tracking'
import { cn } from '../../../lib/ui'
import type { Order } from '../../../types/order'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { Switch } from '../../ui/Switch'
import { IconBubble } from './IconBubble'

interface DelayCardProps {
  order: Order
  now: Date
  hasOpenCase: boolean
  onToggleAlerts: (enabled: boolean) => void
  onChat: () => void
  onReport: () => void
}

export function DelayCard({ order, now, hasOpenCase, onToggleAlerts, onChat, onReport }: DelayCardProps) {
  const guarantee = getDelayGuaranteeDate(order)
  const canClaimNow = now >= guarantee
  const reason =
    order.delay?.reason ??
    "The estimated delivery date has passed and the carrier hasn't shared a new one yet. We've asked them to locate your package."

  return (
    <Card className="overflow-hidden ring-amber-200" aria-labelledby="delay-title">
      <div className="bg-amber-50/60 p-4">
        <div className="flex gap-3">
          <IconBubble className="bg-amber-100 text-amber-700">
            <TriangleAlert className="size-5" />
          </IconBubble>
          <div>
            <h3 id="delay-title" className="text-[15px] font-semibold text-slate-900">
              Why it's late
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{reason}</p>
            {order.delay && (
              <p className="mt-2 text-xs text-slate-500">Carrier update {formatRelative(order.delay.updatedAt, now)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">What you can do</h4>
        <Switch
          checked={order.alertsEnabled}
          onChange={onToggleAlerts}
          label="Get delay alerts"
          description="We'll text you the moment your package moves."
        />
        <div className="flex gap-3 rounded-xl bg-emerald-50/70 p-3 ring-1 ring-emerald-100">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
          <p className="text-sm leading-relaxed text-slate-700">
            {canClaimNow ? (
              <>
                <strong className="font-semibold text-slate-900">You're covered.</strong> Your package is well past its
                delivery date, so you can request a full refund or a free replacement now.
              </>
            ) : (
              <>
                <strong className="font-semibold text-slate-900">Not here by {formatShortDate(guarantee)}?</strong> You
                can choose a full refund or a free replacement. No need to send anything back.
              </>
            )}
          </p>
        </div>
        <div className={cn('grid gap-2', !hasOpenCase && 'grid-cols-2')}>
          {canClaimNow && !hasOpenCase ? (
            <>
              <Button onClick={onReport}>Get refund or replacement</Button>
              <Button variant="outline" onClick={onChat} icon={<MessageCircle className="size-4" aria-hidden />}>
                Chat
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onChat} icon={<MessageCircle className="size-4" aria-hidden />}>
                Chat with us
              </Button>
              {!hasOpenCase && (
                <Button variant="outline" onClick={onReport}>
                  Report issue
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
