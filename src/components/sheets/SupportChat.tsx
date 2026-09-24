import { ArrowLeft, Send } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { sendSupportMessage } from '../../data/mockApi'
import { formatShortDate, formatWindow } from '../../lib/format'
import type { TrackingSummary } from '../../lib/tracking'
import { cn } from '../../lib/ui'
import type { Order } from '../../types/order'
import { IconButton } from '../ui/Button'
import { SheetBody, SheetFooter, SheetHeader } from '../ui/Sheet'

const AGENT = 'Maya'

interface Message {
  id: number
  from: 'agent' | 'me' | 'system'
  text: string
}

const QUICK_REPLIES = ['Where is my package?', 'Can I get a refund?', 'Update delivery instructions']

function greeting(order: Order | null, summary: TrackingSummary | null, now: Date) {
  if (!order || !summary) return `Hi there, I'm ${AGENT} from customer support. How can I help today?`
  const first = order.customer.name.split(' ')[0]
  const intro = `Hi ${first}, I'm ${AGENT}.`
  const eta = order.estimatedDelivery
  switch (summary.situation) {
    case 'delayed':
      return `${intro} I can see order #${order.number} is delayed. ${eta ? `It's now expected ${formatWindow(eta, now)}.` : ''} I'm sorry about that. How can I help?`
    case 'not_received':
      return `${intro} I'm sorry your package hasn't turned up. ${order.shipment?.carrier ?? 'The carrier'} marked order #${order.number} as delivered, and I can open an investigation or help another way.`
    case 'investigating':
      return `${intro} I can see case #${order.supportCase?.id} is open for order #${order.number}. We'll have an update by ${formatShortDate(order.supportCase!.respondBy)}. Anything I can help with in the meantime?`
    case 'preparing':
      return `${intro} Order #${order.number} is being packed and should ship within 1 business day. What can I help with?`
    default:
      return `${intro} I have order #${order.number} in front of me. What can I help with?`
  }
}

interface SupportChatProps {
  order: Order | null
  summary: TrackingSummary | null
  now: Date
  onBack: () => void
}

export function SupportChat({ order, summary, now, onBack }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 0, from: 'agent', text: greeting(order, summary, now) },
  ])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const nextId = useRef(1)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages, typing])

  const push = (from: Message['from'], text: string) => {
    const id = nextId.current++
    setMessages((current) => [...current, { id, from, text }])
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || typing) return
    push('me', trimmed)
    setDraft('')
    setTyping(true)
    inputRef.current?.focus({ preventScroll: true })
    try {
      push('agent', await sendSupportMessage(order, trimmed))
    } catch {
      push('system', "Message didn't send. Check your connection and try again.")
    } finally {
      setTyping(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void send(draft)
  }

  const hasUserMessage = messages.some((m) => m.from === 'me')

  return (
    <>
      <SheetHeader
        title={`${AGENT} · Customer support`}
        description="Online · usually replies in under 2 min"
        leading={
          <IconButton label="Back to contact options" onClick={onBack}>
            <ArrowLeft className="size-5" aria-hidden />
          </IconButton>
        }
      />
      <SheetBody className="px-0 pb-0">
        <div
          ref={listRef}
          className="h-[52dvh] max-h-full min-h-60 space-y-3 overflow-y-auto border-y border-slate-100 bg-slate-50 px-4 py-4"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((message) => (
            <div key={message.id} className={cn('flex', message.from === 'me' ? 'justify-end' : 'justify-start')}>
              <p
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  message.from === 'me' && 'rounded-br-md bg-brand-600 text-white',
                  message.from === 'agent' && 'rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200',
                  message.from === 'system' && 'mx-auto bg-rose-50 text-center text-xs text-rose-700',
                )}
              >
                <span className="sr-only">
                  {message.from === 'me' ? 'You: ' : message.from === 'agent' ? `${AGENT}: ` : ''}
                </span>
                {message.text}
              </p>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <p className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 ring-1 ring-slate-200">
                <span className="sr-only">{AGENT} is typing</span>
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    aria-hidden
                    className="size-1.5 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </p>
            </div>
          )}
        </div>
      </SheetBody>
      <SheetFooter className="border-t-0">
        {!hasUserMessage && (
          <div className="-mx-5 mb-3 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 pb-0.5">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => void send(reply)}
                disabled={typing}
                className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-brand-700 ring-1 ring-brand-200 transition-colors hover:bg-brand-50 disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            data-autofocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-full bg-slate-100 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!draft.trim() || typing}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Send className="size-[18px]" aria-hidden />
          </button>
        </form>
      </SheetFooter>
    </>
  )
}
