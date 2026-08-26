import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ThemeToggle } from './ui/ThemeToggle'

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Link
        to="/"
        className="absolute top-5 right-5 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <ArrowRight className="size-4" strokeWidth={2} />
        بازگشت به صفحه اصلی
      </Link>

      <div className="absolute top-5 left-5">
        <ThemeToggle />
      </div>

      <div className="animate-fade-in-up relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link
            to="/"
            className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white shadow-sm shadow-brand-500/20"
          >
            <Sparkles className="size-6" strokeWidth={2} />
          </Link>
          <h1 className="text-lg font-bold text-heading">{title}</h1>
          <p className="mt-1 text-sm text-subtle">{subtitle}</p>
        </div>

        <div className="rounded-2xl bg-surface/90 p-7 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm dark:bg-slate-900/90 dark:ring-slate-800/70">
          {children}
        </div>
      </div>
    </div>
  )
}
