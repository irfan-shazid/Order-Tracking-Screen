import { MessageSquareText } from 'lucide-react'
import { formatShortDate, formatTime } from '../../../lib/format'
import type { IssueType, SupportCase } from '../../../types/order'
import { Card } from '../../ui/Card'
import { IconBubble } from './IconBubble'

const ISSUE_LABELS: Record<IssueType, string> = {
  not_received: 'Package not received',
  late: 'Package is late',
  damaged: 'Item arrived damaged',
  wrong_item: 'Wrong or missing item',
  other: 'Other issue',
}

export function OpenCaseCard({ supportCase, onChat }: { supportCase: SupportCase; onChat: () => void }) {
  return (
    <Card className="flex gap-3 p-4" aria-label={`Support case ${supportCase.id}`}>
      <IconBubble className="bg-brand-50 text-brand-600">
        <MessageSquareText className="size-5" />
      </IconBubble>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">We're on it · Case #{supportCase.id}</p>
        <p className="mt-0.5 text-sm text-slate-600">
          {ISSUE_LABELS[supportCase.type]}. Expect a reply by {formatShortDate(supportCase.respondBy)},{' '}
          {formatTime(supportCase.respondBy)}.
        </p>
        <button type="button" onClick={onChat} className="mt-2 text-sm font-semibold text-brand-700 hover:underline">
          Chat about this case
        </button>
      </div>
    </Card>
  )
}
