import { X } from 'lucide-react'
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn, prefersReducedMotion } from '../../lib/ui'
import { IconButton } from './Button'

const EXIT_MS = 200
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

let scrollLocks = 0
function lockScroll() {
  scrollLocks += 1
  if (scrollLocks > 1) return
  document.body.style.overflow = 'hidden'
  document.querySelector<HTMLElement>('[data-scroll-root]')?.style.setProperty('overflow', 'hidden')
}
function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1)
  if (scrollLocks > 0) return
  document.body.style.overflow = ''
  document.querySelector<HTMLElement>('[data-scroll-root]')?.style.removeProperty('overflow')
}

const SheetContext = createContext<{ titleId: string; descriptionId: string; onClose: () => void } | null>(null)

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Sheet({ open, onClose, children }: SheetProps) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const latest = useRef({ onClose, closing })
  useEffect(() => {
    latest.current = { onClose, closing }
  })

  if (open && !mounted) setMounted(true)
  if (open && closing) setClosing(false)
  if (!open && mounted && !closing) setClosing(true)

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(
      () => {
        setMounted(false)
        setClosing(false)
      },
      prefersReducedMotion() ? 0 : EXIT_MS,
    )
    return () => clearTimeout(timer)
  }, [closing])

  useEffect(() => {
    if (!mounted) return
    const panel = panelRef.current
    const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const initial = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel
    initial?.focus({ preventScroll: true })
    lockScroll()

    function handleKeyDown(event: KeyboardEvent) {
      if (!panel || latest.current.closing) return
      if (event.key === 'Escape') {
        event.preventDefault()
        latest.current.onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      if (!panel.contains(active)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      unlockScroll()
      const active = document.activeElement
      const focusIsOurs = !active || active === document.body || (panel?.contains(active) ?? false)
      if (focusIsOurs && returnFocusTo?.isConnected) returnFocusTo.focus({ preventScroll: true })
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div className={cn('fixed inset-0 z-50 flex items-end justify-center', closing && 'pointer-events-none')}>
      <div
        aria-hidden
        onClick={onClose}
        className={cn('absolute inset-0 bg-slate-950/45', closing ? 'animate-fade-out' : 'animate-fade-in')}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92%] w-full max-w-[430px] flex-col rounded-t-[28px] bg-white shadow-2xl outline-none',
          closing ? 'animate-sheet-out' : 'animate-sheet-in',
        )}
      >
        <div className="flex justify-center pt-2.5 pb-1" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-slate-300" />
        </div>
        <SheetContext.Provider value={{ titleId, descriptionId, onClose }}>{children}</SheetContext.Provider>
      </div>
    </div>
  )
}

interface SheetHeaderProps {
  title: string
  description?: string
  leading?: ReactNode
}

export function SheetHeader({ title, description, leading }: SheetHeaderProps) {
  const context = useContext(SheetContext)
  if (!context) throw new Error('SheetHeader must be rendered inside <Sheet>')
  return (
    <header className="flex items-center gap-1 px-5 pt-1 pb-3">
      {leading && <div className="-ml-2">{leading}</div>}
      <div className="min-w-0 flex-1">
        <h2 id={context.titleId} className="truncate text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p id={context.descriptionId} className="truncate text-[13px] text-slate-500">
            {description}
          </p>
        )}
      </div>
      <IconButton label="Close" onClick={context.onClose} className="-mr-2 shrink-0">
        <X className="size-5" aria-hidden />
      </IconButton>
    </header>
  )
}

export function SheetBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6', className)}>{children}</div>
}

export function SheetFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'border-t border-slate-100 bg-white px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      {children}
    </div>
  )
}
