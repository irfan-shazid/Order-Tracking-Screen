import { Headset, Package } from 'lucide-react'
import { IconButton } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'

interface AppBarProps {
  orderNumber?: string
  loading?: boolean
  onHelp: () => void
}

export function AppBar({ orderNumber, loading, onHelp }: AppBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <div className="flex h-14 items-center gap-3 px-4">
        <div
          aria-hidden
          className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm"
        >
          <Package className="size-[18px]" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <h1 className="text-[15px] font-semibold text-slate-900">Track order</h1>
          {loading ? (
            <Skeleton className="mt-1 h-3 w-20" />
          ) : (
            orderNumber && <p className="truncate text-xs text-slate-500">#{orderNumber}</p>
          )}
        </div>
        <IconButton label="Contact support" onClick={onHelp} className="-mr-2">
          <Headset className="size-5" aria-hidden />
        </IconButton>
      </div>
    </header>
  )
}
