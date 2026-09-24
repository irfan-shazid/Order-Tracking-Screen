import { ChevronRight, Mail, MessageCircle, Phone, TriangleAlert, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import type { TrackingSummary } from '../../lib/tracking'
import type { Order } from '../../types/order'
import { ProductThumb } from '../tracking/ProductThumb'
import { Sheet, SheetBody, SheetHeader } from '../ui/Sheet'
import { SupportChat } from './SupportChat'

const SUPPORT_PHONE = { display: '+1 (800) 555-0199', href: 'tel:+18005550199' }
const SUPPORT_EMAIL = 'support@example.com'

export type SupportView = 'menu' | 'chat'

interface SupportSheetProps {
  open: boolean
  onClose: () => void
  initialView: SupportView
  order: Order | null
  summary: TrackingSummary | null
  now: Date
  onReport?: () => void
}

export function SupportSheet({ open, onClose, ...rest }: SupportSheetProps) {
  return (
    <Sheet open={open} onClose={onClose}>
      <SupportContent {...rest} />
    </Sheet>
  )
}

function SupportContent({ initialView, order, summary, now, onReport }: Omit<SupportSheetProps, 'open' | 'onClose'>) {
  const [view, setView] = useState<SupportView>(initialView)
  const chatOptionRef = useRef<HTMLButtonElement>(null)
  const returningFromChat = useRef(false)

  useEffect(() => {
    if (view === 'menu' && returningFromChat.current) {
      returningFromChat.current = false
      chatOptionRef.current?.focus()
    }
  }, [view])

  if (view === 'chat') {
    return (
      <SupportChat
        order={order}
        summary={summary}
        now={now}
        onBack={() => {
          returningFromChat.current = true
          setView('menu')
        }}
      />
    )
  }

  const subject = encodeURIComponent(order ? `Help with order ${order.number}` : 'Help with my order')

  return (
    <>
      <SheetHeader title="Contact support" description="We're here 7 days a week" />
      <SheetBody>
        {order && summary && (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
            <ProductThumb art={order.items[0].art} size="sm" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">About order #{order.number}</p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {summary.badge} · {summary.headline}
              </p>
            </div>
          </div>
        )}

        <ul className="mt-4 space-y-2">
          <li>
            <OptionRow
              buttonRef={chatOptionRef}
              onClick={() => setView('chat')}
              icon={MessageCircle}
              title="Chat with us"
              description="Typical reply in under 2 minutes"
              badge={<OnlineBadge />}
            />
          </li>
          <li>
            <OptionRow
              href={SUPPORT_PHONE.href}
              icon={Phone}
              title={`Call ${SUPPORT_PHONE.display}`}
              description="Daily, 7 AM – 11 PM CT"
            />
          </li>
          <li>
            <OptionRow
              href={`mailto:${SUPPORT_EMAIL}?subject=${subject}`}
              icon={Mail}
              title="Email us"
              description="We reply within 24 hours"
            />
          </li>
        </ul>

        {onReport && (
          <button
            type="button"
            onClick={onReport}
            className="mt-4 flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-left transition-colors hover:bg-slate-50"
          >
            <TriangleAlert className="size-5 shrink-0 text-amber-600" aria-hidden />
            <span className="flex-1 text-sm text-slate-700">
              Problem with the delivery? <span className="font-semibold text-brand-700">Report it</span>
            </span>
            <ChevronRight className="size-4 text-slate-400" aria-hidden />
          </button>
        )}
      </SheetBody>
    </>
  )
}

function OnlineBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
      Online
    </span>
  )
}

interface OptionRowProps {
  icon: LucideIcon
  title: string
  description: string
  badge?: ReactNode
  href?: string
  onClick?: () => void
  buttonRef?: Ref<HTMLButtonElement>
}

function OptionRow({ icon: Icon, title, description, badge, href, onClick, buttonRef }: OptionRowProps) {
  const className =
    'flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 ring-slate-200 transition-colors hover:bg-slate-50 active:bg-slate-100'
  const content = (
    <>
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
        aria-hidden
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {title}
          {badge}
        </span>
        <span className="block text-[13px] text-slate-500">{description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden />
    </>
  )
  return href ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <button type="button" ref={buttonRef} onClick={onClick} className={className}>
      {content}
    </button>
  )
}
