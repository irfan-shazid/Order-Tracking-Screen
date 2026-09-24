import { Bell } from 'lucide-react'
import type { Order } from '../../../types/order'
import { Card } from '../../ui/Card'
import { Switch } from '../../ui/Switch'
import { IconBubble } from './IconBubble'

export function AlertsCard({ order, onToggleAlerts }: { order: Order; onToggleAlerts: (enabled: boolean) => void }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <IconBubble className="bg-brand-50 text-brand-600">
        <Bell className="size-5" />
      </IconBubble>
      <Switch
        checked={order.alertsEnabled}
        onChange={onToggleAlerts}
        label="Delivery alerts"
        description={
          order.stage === 'out_for_delivery'
            ? 'Text me when the driver is 2 stops away'
            : 'Text me when it’s out for delivery'
        }
      />
    </Card>
  )
}
