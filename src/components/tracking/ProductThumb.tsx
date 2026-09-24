import {
  Archive,
  Bean,
  BedDouble,
  Cable,
  Coffee,
  Footprints,
  Headphones,
  LampDesk,
  Shirt,
  ShoppingBag,
  Watch,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../lib/ui'
import type { ProductArt } from '../../types/order'

const ART: Record<ProductArt, { icon: LucideIcon; className: string }> = {
  headphones: { icon: Headphones, className: 'from-slate-700 to-slate-900 text-white' },
  cable: { icon: Cable, className: 'from-zinc-200 to-zinc-300 text-zinc-700' },
  coffee: { icon: Coffee, className: 'from-orange-100 to-amber-200 text-amber-800' },
  beans: { icon: Bean, className: 'from-amber-700 to-amber-900 text-amber-100' },
  shoe: { icon: Footprints, className: 'from-sky-100 to-sky-300 text-sky-800' },
  socks: { icon: Shirt, className: 'from-slate-50 to-slate-200 text-slate-600' },
  lamp: { icon: LampDesk, className: 'from-stone-50 to-stone-200 text-stone-700' },
  organizer: { icon: Archive, className: 'from-yellow-100 to-amber-200 text-amber-800' },
  watch: { icon: Watch, className: 'from-neutral-600 to-neutral-800 text-neutral-100' },
  tote: { icon: ShoppingBag, className: 'from-lime-100 to-green-300 text-green-900' },
  pillow: { icon: BedDouble, className: 'from-orange-50 to-orange-200 text-orange-800' },
}

export function ProductThumb({
  art,
  size = 'md',
  className,
}: {
  art: ProductArt
  size?: 'sm' | 'md'
  className?: string
}) {
  const { icon: Icon, className: tone } = ART[art]
  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-black/5',
        size === 'md' ? 'size-14' : 'size-10',
        tone,
        className,
      )}
    >
      <Icon className={size === 'md' ? 'size-6' : 'size-5'} strokeWidth={1.75} />
    </div>
  )
}
