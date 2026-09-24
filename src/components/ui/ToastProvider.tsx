import { CircleAlert, CircleCheck } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastTone } from '../../hooks/useToast'

interface Toast {
  id: number
  message: string
  tone: ToastTone
}

const DURATION_MS = 3200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const show = useCallback((message: string, tone: ToastTone = 'default') => {
    nextId.current += 1
    const id = nextId.current
    setToasts([{ id, message, tone }])
    const timer = setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id))
      timers.current.delete(timer)
    }, DURATION_MS)
    timers.current.add(timer)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-[398px] animate-toast-in items-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/20"
          >
            {toast.tone === 'success' && <CircleCheck className="size-5 shrink-0 text-emerald-400" aria-hidden />}
            {toast.tone === 'error' && <CircleAlert className="size-5 shrink-0 text-rose-400" aria-hidden />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
