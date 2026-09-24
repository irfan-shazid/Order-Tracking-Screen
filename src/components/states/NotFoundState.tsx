import { CircleAlert, PackageSearch, Search } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { cn } from '../../lib/ui'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const SAMPLE_ORDERS = ['VS-20418', 'VS-19102', 'VS-20671']

export function NotFoundState({ query, onSearch }: { query: string; onSearch: (orderNumber: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!value.trim()) {
      setError('Enter your order number')
      return
    }
    onSearch(value)
  }

  return (
    <Card className="px-5 py-8">
      <div className="text-center" role="alert">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <PackageSearch className="size-7" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">We couldn't find that order</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-slate-600">
          No order matches <strong className="font-semibold text-slate-900">#{query}</strong>. Check the number in your
          confirmation email and try again.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-900">
          Order number
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id={inputId}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. VS-20418"
            autoCapitalize="characters"
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'h-11 min-w-0 flex-1 rounded-xl bg-white px-3 text-base text-slate-900 uppercase ring-1 placeholder:text-slate-400 placeholder:normal-case focus:ring-2 focus:outline-none',
              error ? 'ring-rose-400 focus:ring-rose-500' : 'ring-slate-300 focus:ring-brand-500',
            )}
          />
          <Button type="submit" icon={<Search className="size-4" aria-hidden />}>
            Find
          </Button>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 flex items-center gap-1.5 text-[13px] text-rose-600">
            <CircleAlert className="size-4" aria-hidden />
            {error}
          </p>
        )}
      </form>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-medium text-slate-500">Try a sample order</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SAMPLE_ORDERS.map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => onSearch(number)}
              className="rounded-full bg-slate-100 px-3 py-1.5 font-mono text-xs font-semibold text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {number}
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}
