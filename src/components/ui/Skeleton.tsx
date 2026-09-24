import { cn } from '../../lib/ui'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-slate-200/80', className)} />
}
