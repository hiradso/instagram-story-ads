import type { LucideIcon } from 'lucide-react'

export function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
      <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-white text-brand-500 ring-1 ring-slate-200/70">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-900">{value}</p>
    </div>
  )
}
