import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Camera,
  ClipboardCheck,
  Crown,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Settings,
  Sparkles,
  User,
  UserCog,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { formatNumber, roleLabel } from '../lib/labels'
import { HoverLabel, InfoTooltip } from './ui/Tooltip'
import { ThemeToggle } from './ui/ThemeToggle'

interface NavItem {
  to: string
  label: string
  icon: typeof Camera
}

const navByRole: Record<string, NavItem[]> = {
  advertiser: [
    { to: '/advertiser/campaigns', label: 'کمپین‌ها', icon: Megaphone },
    { to: '/advertiser/ambassadors', label: 'پیدا کردن سفیر', icon: Users },
    { to: '/conversations', label: 'گفت‌وگوها', icon: MessageCircle },
    { to: '/advertiser/wallet', label: 'کیف‌پول', icon: Wallet },
  ],
  ambassador: [
    { to: '/ambassador/assignments', label: 'کمپین‌های من', icon: Camera },
    { to: '/conversations', label: 'گفت‌وگوها', icon: MessageCircle },
    { to: '/ambassador/wallet', label: 'کیف‌پول', icon: Wallet },
    { to: '/ambassador/profile', label: 'پروفایل', icon: User },
  ],
  admin: [
    { to: '/admin', label: 'داشبورد', icon: LayoutDashboard },
    { to: '/admin/submissions', label: 'بازبینی اسکرین‌شات‌ها', icon: ClipboardCheck },
    { to: '/admin/campaigns', label: 'کمپین‌ها', icon: Megaphone },
    { to: '/admin/profiles', label: 'سفیرها', icon: Users },
    { to: '/admin/withdrawals', label: 'برداشت‌ها', icon: Wallet },
    { to: '/admin/users', label: 'کاربران', icon: UserCog },
  ],
}

function initials(name: string) {
  return name.trim().slice(0, 1)
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const items = user ? navByRole[user.role] ?? [] : []
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="animate-fade-in fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 shrink-0 flex-col transition-transform duration-300 ease-out md:sticky md:top-0 md:z-10 md:h-screen md:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } ${
          isAdmin
            ? 'bg-gradient-to-b from-[#1a0f36] via-[#150a2b] to-[#0c0620] ring-1 ring-amber-400/10'
            : 'border-l border-slate-200/70 bg-surface dark:border-slate-800/70 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 pt-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className={`flex size-9 items-center justify-center rounded-xl text-white shadow-sm ${
                isAdmin
                  ? 'bg-gradient-to-tl from-amber-500 via-yellow-400 to-amber-600 text-[#1a0f36] shadow-amber-500/30'
                  : 'bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 shadow-brand-500/30'
              }`}
            >
              {isAdmin ? <Crown className="size-4.5" strokeWidth={2} /> : <Sparkles className="size-4" strokeWidth={2} />}
            </span>
            <h1 className={`flex items-baseline gap-1.5 text-base font-bold ${isAdmin ? 'text-amber-50' : 'text-heading'}`}>
              ادیار
              <span className={`text-xs font-medium ${isAdmin ? 'text-amber-200/50' : 'text-faint'}`} dir="ltr">
                Adyar
              </span>
            </h1>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="بستن منو"
            className={`flex size-8 items-center justify-center rounded-lg md:hidden ${
              isAdmin ? 'text-amber-200/60 hover:bg-white/5 hover:text-amber-100' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <X className="size-4.5" strokeWidth={1.75} />
          </button>
        </div>

        {user && (
          <div className={`mx-5 mt-5 flex items-center gap-2.5 rounded-xl p-3 ${isAdmin ? 'bg-white/5 ring-1 ring-amber-400/10' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                isAdmin ? 'bg-gradient-to-tl from-amber-500 to-amber-600 text-[#1a0f36] ring-2 ring-amber-400/40' : 'bg-brand-600'
              }`}
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0 text-xs leading-tight">
              <p className={`truncate font-medium ${isAdmin ? 'text-amber-50' : 'text-heading'}`}>{user.name}</p>
              <p className={`flex items-center gap-1 ${isAdmin ? 'text-amber-200/50' : 'text-faint'}`}>
                {roleLabel[user.role]}
                {user.role === 'ambassador' && (
                  <>
                    {` · سطح ${formatNumber(user.level)}`}
                    <InfoTooltip>
                      سطح بالاتر یعنی می‌تونی هم‌زمان کمپین‌های بیشتری بگیری. با تایید شدن بازدیدهات خودکار ارتقا
                      می‌گیری.
                    </InfoTooltip>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
          {items.map((item) => {
            const active = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isAdmin
                    ? active
                      ? 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20'
                      : 'text-indigo-200/70 hover:bg-white/5 hover:text-amber-100'
                    : active
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <item.icon className="size-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className={`flex items-center justify-between gap-2 border-t px-4 py-4 ${isAdmin ? 'border-white/10' : 'border-slate-200/70 dark:border-slate-800/70'}`}>
          <div className="flex items-center gap-1">
            <HoverLabel label="تنظیمات حساب" position="top" align="end">
              <Link
                to="/settings"
                className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                  isAdmin ? 'text-amber-200/60 hover:bg-white/5 hover:text-amber-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Settings className="size-4" strokeWidth={1.75} />
              </Link>
            </HoverLabel>

            <HoverLabel label="خروج" position="top">
              <button
                onClick={() => logout()}
                className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                  isAdmin ? 'text-amber-200/60 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400'
                }`}
              >
                <LogOut className="size-4" strokeWidth={1.75} />
              </button>
            </HoverLabel>
          </div>

          <ThemeToggle position="top" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-surface/80 px-4 py-3 backdrop-blur-md md:hidden dark:border-slate-800/70 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="باز کردن منو"
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Menu className="size-5" strokeWidth={1.75} />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white">
              <Sparkles className="size-3.5" strokeWidth={2} />
            </span>
            <span className="text-sm font-bold text-heading">ادیار</span>
          </Link>

          <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {user ? initials(user.name) : ''}
          </span>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
