import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { InfoTooltip } from './Tooltip'

const baseInput =
  'w-full rounded-xl border border-slate-200 bg-surface px-3 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/20 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-600'

export function Label({ children, tooltip }: { children: ReactNode; tooltip?: ReactNode }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-body">
      {children}
      {tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
    </label>
  )
}

export function TextInput({
  icon: Icon,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { icon?: LucideIcon }) {
  if (!Icon) return <input className={`${baseInput} ${className}`} {...rest} />

  return (
    <div className={`relative ${className}`}>
      <Icon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint" />
      <input className={`${baseInput} pr-9`} {...rest} />
    </div>
  )
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseInput} ${className}`} {...rest} />
}

export function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select className={`${baseInput} appearance-none bg-no-repeat pl-8`} {...rest} />
      <ChevronDown className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
    </div>
  )
}
