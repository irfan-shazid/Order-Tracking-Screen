import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

export function LoadingState() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">Loading your order…</span>
      <Card className="overflow-hidden">
        <div className="space-y-3 p-4">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-16 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-4 gap-2 border-t border-slate-100 px-4 pt-5 pb-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </Card>
      <Card className="space-y-4 p-4">
        <Skeleton className="h-5 w-36" />
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-4 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </Card>
      <Card className="space-y-3 p-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </Card>
    </div>
  )
}
