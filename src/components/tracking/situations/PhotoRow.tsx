import { ChevronRight } from 'lucide-react'
import { formatDayAndTime } from '../../../lib/format'
import type { Order } from '../../../types/order'
import { DeliveryPhoto } from '../DeliveryPhoto'

export function PhotoRow({ order, now, onView }: { order: Order; now: Date; onView: () => void }) {
  if (!order.delivery?.hasPhoto) return null
  return (
    <button
      type="button"
      onClick={onView}
      className="flex w-full items-center gap-3 rounded-xl bg-slate-50 p-2 pr-3 text-left ring-1 ring-slate-200/70 transition-colors hover:bg-slate-100"
    >
      <span className="w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/5">
        <DeliveryPhoto />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">View delivery photo</span>
        <span className="block text-xs text-slate-500">
          Taken by the driver · {formatDayAndTime(order.delivery.deliveredAt, now)}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden />
    </button>
  )
}
