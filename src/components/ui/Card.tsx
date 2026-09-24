import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/ui'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article'
}

export function Card({ as: Tag = 'section', className, children, ...rest }: CardProps) {
  return (
    <Tag
      className={cn('rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/80', className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}

interface CardHeaderProps {
  title: string
  id?: string
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, id, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-4 pt-4', className)}>
      <div className="min-w-0">
        <h2 id={id} className="text-[15px] font-semibold text-slate-900">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="-mt-1 -mr-1 shrink-0">{action}</div>}
    </div>
  )
}
