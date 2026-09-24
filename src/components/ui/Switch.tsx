import { cn } from '../../lib/ui'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Switch({ checked, onChange, label, description, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl text-left transition-colors disabled:opacity-60',
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">{description}</span>}
      </span>
      <span
        aria-hidden
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200',
          checked ? 'bg-brand-600' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'inline-block size-6 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}
