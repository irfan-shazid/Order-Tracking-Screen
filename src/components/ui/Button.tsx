import { LoaderCircle } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/ui'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'warning'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300',
  outline: 'bg-white text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 active:bg-slate-100',
  ghost: 'text-brand-700 hover:bg-brand-50 active:bg-brand-100',
  warning: 'bg-amber-500 text-white shadow-sm hover:bg-amber-600 active:bg-amber-700',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-[15px] gap-2 rounded-xl',
  lg: 'h-12 px-5 text-base gap-2 rounded-xl',
}

function buttonClasses({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
}: { variant?: Variant; size?: Size; block?: boolean; className?: string } = {}) {
  return cn(
    'inline-flex items-center justify-center font-semibold transition-colors select-none',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    block && 'w-full',
    className,
  )
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
  size?: Size
  block?: boolean
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant,
  size,
  block,
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, block, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

interface IconButtonProps extends ComponentProps<'button'> {
  label: string
}

export function IconButton({ label, className, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-full text-slate-600 transition-colors',
        'hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
