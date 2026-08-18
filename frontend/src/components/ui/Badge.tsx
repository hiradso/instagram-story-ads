import type { ReactNode } from 'react'

type Tone = 'slate' | 'amber' | 'emerald' | 'orange' | 'blue' | 'red'

const tones: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
}

export function Badge({ tone = 'slate', icon, children }: { tone?: Tone; icon?: ReactNode; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  )
}
