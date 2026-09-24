import { CircleCheck } from 'lucide-react'
import type { Order } from '../../../types/order'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { PhotoRow } from './PhotoRow'

interface DeliveredCardProps {
  order: Order
  now: Date
  pending: 'confirmed' | 'not_received' | null
  onConfirm: (receipt: 'confirmed' | 'not_received') => void
  onViewPhoto: () => void
  onReport: () => void
}

export function DeliveredCard({ order, now, pending, onConfirm, onViewPhoto, onReport }: DeliveredCardProps) {
  const confirmed = order.delivery?.receipt === 'confirmed'
  return (
    <Card className="space-y-4 p-4" aria-label="Delivery confirmation">
      <PhotoRow order={order} now={now} onView={onViewPhoto} />
      {confirmed ? (
        <div className="flex items-start gap-3">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-slate-900">You confirmed this order arrived</p>
            <p className="mt-0.5 text-sm text-slate-600">
              Something wrong with an item?{' '}
              <button type="button" onClick={onReport} className="font-semibold text-brand-700 hover:underline">
                Report a problem
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900">Did your package arrive?</h3>
          <p className="mt-1 text-sm text-slate-600">Let us know so we can help right away if anything's wrong.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              onClick={() => onConfirm('confirmed')}
              loading={pending === 'confirmed'}
              disabled={pending !== null}
            >
              Yes, got it
            </Button>
            <Button
              variant="outline"
              onClick={() => onConfirm('not_received')}
              loading={pending === 'not_received'}
              disabled={pending !== null}
            >
              No, can't find it
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
