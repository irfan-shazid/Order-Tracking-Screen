import { formatDayAndTime, formatTime } from '../../lib/format'
import type { Order } from '../../types/order'
import { DeliveryPhoto } from '../tracking/DeliveryPhoto'
import { Button } from '../ui/Button'
import { Sheet, SheetBody, SheetFooter, SheetHeader } from '../ui/Sheet'

interface DeliveryPhotoSheetProps {
  open: boolean
  onClose: () => void
  order: Order
  now: Date
  onNotMine: () => void
}

export function DeliveryPhotoSheet({ open, onClose, order, now, onNotMine }: DeliveryPhotoSheetProps) {
  const delivery = order.delivery
  if (!delivery) return null
  const carrier = order.shipment?.carrier ?? 'Carrier'
  const alreadyReported = order.supportCase?.type === 'not_received' && order.supportCase.status === 'open'
  const confirmed = delivery.receipt === 'confirmed'

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHeader title="Delivery photo" description={`${carrier} · ${formatDayAndTime(delivery.deliveredAt, now)}`} />
      <SheetBody>
        <div className="overflow-hidden rounded-2xl ring-1 ring-black/5">
          <DeliveryPhoto caption={`${carrier} · ${formatTime(delivery.deliveredAt)} · ${delivery.location}`} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Left at</dt>
            <dd className="font-semibold text-slate-900">{delivery.location}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Signature</dt>
            <dd className="font-semibold text-slate-900">Not required</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-slate-600">
          Compare the door, house number and doormat with your home. If it doesn't match, the package may have gone to
          the wrong address. Let us know and we'll sort it out.
        </p>
      </SheetBody>
      {!confirmed && !alreadyReported && (
        <SheetFooter>
          <Button block variant="outline" onClick={onNotMine}>
            That's not my door
          </Button>
        </SheetFooter>
      )}
    </Sheet>
  )
}
