import type { ReactNode } from 'react'
import { cn } from '../../../lib/ui'

export function IconBubble({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', className)} aria-hidden>
      {children}
    </span>
  )
}
