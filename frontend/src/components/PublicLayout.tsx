import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUp, ChevronDown, LayoutDashboard, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { roleHome, roleLabel } from '../lib/labels'
import { ThemeToggle } from './ui/ThemeToggle'
import { Button } from './ui/Button'

const navLinks = [
  { to: '/', label: 'صفحه اصلی' },
  { to: '/about', label: 'درباره ما' },
  { to: '/guide', label: 'راهنمای استفاده' },
]

function initials(name: string) {
  return name.trim().slice(0, 1)
}

function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return

    function handleOutsideClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [open])

  if (!user) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl py-1 pr-1 pl-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-tl from-brand-500 to-accent-400 text-xs font-bold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden text-right text-xs leading-tight sm:block">
          <span className="block font-medium text-heading">{user.name}</span>
          <span className="block text-faint">{roleLabel[user.role]}</span>
        </span>
        <ChevronDown className="size-3.5 text-slate-400" strokeWidth={2} />
      </button>

      {open && (
        <div className="animate-scale-in absolute left-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl bg-surface py-1 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
          <Link
            to={roleHome[user.role]}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <LayoutDashboard className="size-4" strokeWidth={1.75} />
            پنل کاربری
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              logout().then(() => navigate('/'))
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
            خروج
          </button>
        </div>
      )}
    </div>
  )
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="برو به بالای صفحه"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/30 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/40 ${
        visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-50 opacity-0'
      }`}
    >
      <ArrowUp className="size-5" strokeWidth={2.25} />
    </button>
  )
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-surface/80 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white shadow-sm shadow-brand-500/30">
              <Sparkles className="size-4" strokeWidth={2} />
            </span>
            <h1 className="flex items-baseline gap-1.5 text-base font-bold text-heading">
              ادیار
              <span className="text-xs font-medium text-faint" dir="ltr">
                Adyar
              </span>
            </h1>
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
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    ورود
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">ثبت‌نام</Button>
                </Link>
              </>
            )}
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
              <span className="flex items-baseline gap-1 text-sm font-bold text-heading">
                ادیار
                <span className="text-[10px] font-medium text-faint" dir="ltr">
                  Adyar
                </span>
              </span>
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
            © {new Date().getFullYear()} ادیار — پلتفرم مدیریت کمپین تبلیغات استوری اینستاگرام
          </p>
        </div>
      </footer>

      <ScrollToTopButton />
    </div>
  )
}
