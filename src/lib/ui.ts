import type { Tone } from './tracking'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export const toneClasses: Record<
  Tone,
  {
    soft: string
    solid: string
    text: string
    icon: string
    border: string
    ring: string
    dot: string
    gradient: string
  }
> = {
  brand: {
    soft: 'bg-brand-50 text-brand-700',
    solid: 'bg-brand-600 text-white',
    text: 'text-brand-700',
    icon: 'text-brand-600',
    border: 'border-brand-200',
    ring: 'ring-brand-200',
    dot: 'bg-brand-600',
    gradient: 'from-brand-50 via-white to-white',
  },
  success: {
    soft: 'bg-emerald-50 text-emerald-700',
    solid: 'bg-emerald-600 text-white',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    border: 'border-emerald-200',
    ring: 'ring-emerald-200',
    dot: 'bg-emerald-600',
    gradient: 'from-emerald-50 via-white to-white',
  },
  warning: {
    soft: 'bg-amber-50 text-amber-800',
    solid: 'bg-amber-500 text-white',
    text: 'text-amber-800',
    icon: 'text-amber-600',
    border: 'border-amber-200',
    ring: 'ring-amber-200',
    dot: 'bg-amber-500',
    gradient: 'from-amber-50 via-white to-white',
  },
  danger: {
    soft: 'bg-rose-50 text-rose-700',
    solid: 'bg-rose-600 text-white',
    text: 'text-rose-700',
    icon: 'text-rose-600',
    border: 'border-rose-200',
    ring: 'ring-rose-200',
    dot: 'bg-rose-600',
    gradient: 'from-rose-50 via-white to-white',
  },
  neutral: {
    soft: 'bg-slate-100 text-slate-700',
    solid: 'bg-slate-700 text-white',
    text: 'text-slate-700',
    icon: 'text-slate-500',
    border: 'border-slate-200',
    ring: 'ring-slate-200',
    dot: 'bg-slate-400',
    gradient: 'from-slate-50 via-white to-white',
  },
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand('copy')
      el.remove()
      return ok
    } catch {
      return false
    }
  }
}
