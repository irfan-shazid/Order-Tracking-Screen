import { Copy, Hash, MapPin, MessageSquareText, Truck, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { groupTrackingNumber } from '../../lib/format'
import type { Order } from '../../types/order'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'

function Row({
  icon: Icon,
  label,
  children,
  action,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 size-[18px] shrink-0 text-slate-400" aria-hidden />
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-slate-500">{label}</dt>
        <dd className="mt-0.5 text-sm text-slate-900">{children}</dd>
      </div>
      {action && <div className="-my-1 shrink-0">{action}</div>}
    </div>
  )
}

export function DeliveryDetailsCard({
  order,
  onCopyTracking,
}: {
  order: Order
  onCopyTracking: (value: string) => void
}) {
  const { shipment, address } = order
  return (
    <Card aria-labelledby="delivery-details-title">
      <CardHeader id="delivery-details-title" title="Delivery details" />
      <dl className="divide-y divide-slate-100 px-4 pt-1 pb-1">
        <Row icon={Truck} label="Carrier">
          {shipment ? shipment.service : <span className="text-slate-500">Assigned when your order ships</span>}
        </Row>
        <Row
          icon={Hash}
          label="Tracking number"
          action={
            shipment && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCopyTracking(shipment.trackingNumber)}
                icon={<Copy className="size-4" aria-hidden />}
                aria-label="Copy tracking number"
              >
                Copy
              </Button>
            )
          }
        >
          {shipment ? (
            <span className="font-mono text-[13px] tracking-tight">{groupTrackingNumber(shipment.trackingNumber)}</span>
          ) : (
            <span className="text-slate-500">Available after carrier pickup</span>
          )}
        </Row>
        <Row icon={MapPin} label="Delivering to">
          <span className="font-medium">{address.name}</span>
          <br />
          {address.line1}
          {address.line2 && `, ${address.line2}`}
          <br />
          {address.city}, {address.region} {address.postalCode}
        </Row>
        {order.deliveryInstructions && (
          <Row icon={MessageSquareText} label="Delivery instructions">
            {order.deliveryInstructions}
          </Row>
        )}
      </dl>
    </Card>
  )
}
