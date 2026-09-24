import { ChevronRight, MessageCircle, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Card, CardHeader } from '../ui/Card'

function HelpRow({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: LucideIcon
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
        aria-hidden
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="block text-[13px] text-slate-500">{description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden />
    </button>
  )
}

interface HelpCardProps {
  delivered: boolean
  onContact: () => void
  onReport: () => void
}

export function HelpCard({ delivered, onContact, onReport }: HelpCardProps) {
  return (
    <Card aria-labelledby="help-title">
      <CardHeader id="help-title" title="Need help?" subtitle="Real people, 7 days a week" />
      <div className="px-2 pt-2 pb-2">
        <HelpRow
          icon={MessageCircle}
          title="Contact support"
          description="Chat, call or email us"
          onClick={onContact}
        />
        <HelpRow
          icon={TriangleAlert}
          title="Report a delivery issue"
          description={delivered ? 'Missing, damaged or wrong items' : 'Late package or something else'}
          onClick={onReport}
        />
      </div>
    </Card>
  )
}
