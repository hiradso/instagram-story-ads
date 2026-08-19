import type { LucideIcon } from 'lucide-react'

export function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:ring-slate-800">
      <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-surface text-brand-500 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:text-brand-400 dark:ring-slate-700">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <p className="text-xs text-faint">{label}</p>
      <p className="mt-0.5 font-semibold text-heading">{value}</p>
    </div>
  )
}
