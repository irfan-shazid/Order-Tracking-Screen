import { Headset, RotateCcw, WifiOff } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function ErrorState({ onRetry, onContactSupport }: { onRetry: () => void; onContactSupport: () => void }) {
  return (
    <Card className="px-6 py-10 text-center" role="alert">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <WifiOff className="size-7" aria-hidden />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">We couldn't load your tracking info</h2>
      <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-slate-600">
        This is usually a brief connection problem. Your order is safe and still on its way.
      </p>
      <div className="mt-6 space-y-2">
        <Button block size="lg" onClick={onRetry} icon={<RotateCcw className="size-4" aria-hidden />}>
          Try again
        </Button>
        <Button block variant="ghost" onClick={onContactSupport} icon={<Headset className="size-4" aria-hidden />}>
          Contact support
        </Button>
      </div>
    </Card>
  )
}
