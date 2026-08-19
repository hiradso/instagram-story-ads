import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { ThemeToggle } from './ui/ThemeToggle'
import { Button } from './ui/Button'

const navLinks = [
  { to: '/', label: 'صفحه اصلی' },
  { to: '/about', label: 'درباره ما' },
  { to: '/guide', label: 'راهنمای استفاده' },
]

export function PublicLayout({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-surface/80 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white shadow-sm shadow-brand-500/30">
              <Sparkles className="size-4" strokeWidth={2} />
            </span>
            <h1 className="text-base font-bold text-heading">استوری‌یار</h1>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => {
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                ورود
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">ثبت‌نام</Button>
            </Link>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-200/70 px-6 py-2 md:hidden dark:border-slate-800/70">
          {navLinks.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200/70 dark:border-slate-800/70">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-right">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white">
                <Sparkles className="size-3.5" strokeWidth={2} />
              </span>
              <span className="text-sm font-bold text-heading">استوری‌یار</span>
            </Link>

            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-subtle">
              <Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400">
                درباره ما
              </Link>
              <Link to="/guide" className="hover:text-brand-600 dark:hover:text-brand-400">
                راهنمای استفاده
              </Link>
              <Link to="/register" className="hover:text-brand-600 dark:hover:text-brand-400">
                ثبت‌نام
              </Link>
            </nav>
          </div>
          <p className="mt-6 text-center text-xs text-faint sm:text-right">
            © {new Date().getFullYear()} استوری‌یار — پلتفرم مدیریت کمپین تبلیغات استوری اینستاگرام
          </p>
        </div>
      </footer>
    </div>
  )
}
