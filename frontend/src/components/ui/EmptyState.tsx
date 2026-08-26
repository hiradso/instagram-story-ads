import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-surface/60 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-slate-200/70 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-slate-800">
        <Icon className="size-6" strokeWidth={1.75} />
      </div>
      <p className="font-medium text-heading">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-faint">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
