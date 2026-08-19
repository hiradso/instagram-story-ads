import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { ThemeToggle } from './ui/ThemeToggle'

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-brand-400/30 to-accent-400/20 blur-3xl dark:from-brand-500/20 dark:to-accent-500/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-accent-400/20 to-brand-500/20 blur-3xl dark:from-accent-500/10 dark:to-brand-600/15" />

      <div className="absolute top-5 left-5">
        <ThemeToggle />
      </div>

      <div className="animate-fade-in-up relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="size-6" strokeWidth={2} />
          </span>
          <h1 className="text-lg font-bold text-heading">{title}</h1>
          <p className="mt-1 text-sm text-subtle">{subtitle}</p>
        </div>

        <div className="rounded-2xl bg-white/90 p-7 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/70 backdrop-blur-sm dark:bg-slate-900/90 dark:shadow-black/20 dark:ring-slate-800/70">
          {children}
        </div>
      </div>
    </div>
  )
}
