import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Camera,
  ClipboardCheck,
  Crown,
  Gem,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Settings,
  Sparkles,
  Star,
  Swords,
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
  // Purely cosmetic 1-3 tier (see User::panelTier on the backend) — how
  // ornate the ambassador/advertiser dashboard chrome gets. Admin has its
  // own fixed throne-room theme instead, independent of this.
  const tier = Math.min(3, Math.max(1, user?.tier ?? 1))

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
    <div className="flex min-h-screen bg-slate-200 dark:bg-slate-950">
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="animate-fade-in fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 shrink-0 flex-col overflow-hidden transition-transform duration-300 ease-out md:sticky md:top-0 md:z-10 md:h-screen md:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } ${
          isAdmin
            ? 'bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 ring-1 ring-red-800/15 dark:from-[#4c0a0a] dark:via-[#2b0505] dark:to-[#0a0202] dark:ring-amber-400/10'
            : tier === 3
              ? 'border-l border-brand-200/60 bg-surface dark:border-brand-900/50 dark:bg-slate-900'
              : 'border-l border-slate-200/70 bg-surface dark:border-slate-800/70 dark:bg-slate-900'
        }`}
      >
        {isAdmin && (
          <>
            <div className="throne-texture pointer-events-none absolute inset-0" />
            {/* A couple of embers drifting up from the hearth — staggered
                timing/drift so they don't read as a repeating loop. */}
            <span className="ember" style={{ right: '18%', animationDuration: '5.5s', animationDelay: '0.2s', ['--ember-drift' as string]: '6px' }} />
            <span className="ember" style={{ right: '55%', animationDuration: '7s', animationDelay: '2s', ['--ember-drift' as string]: '-10px' }} />
            <span className="ember" style={{ right: '80%', animationDuration: '6.2s', animationDelay: '3.4s', ['--ember-drift' as string]: '4px' }} />
          </>
        )}

        {!isAdmin && tier >= 2 && (
          <div
            className={`h-0.5 w-full shrink-0 bg-gradient-to-r ${
              tier === 3 ? 'from-brand-500 via-accent-400 to-brand-500' : 'from-brand-300 via-brand-400 to-brand-300'
            }`}
          />
        )}
        {!isAdmin && tier === 3 && (
          <>
            {/* A couple of quiet sparks for the top tier — same drifting
                ember animation as the admin hearth, just recolored to the
                brand palette so it reads as "special" without borrowing
                the admin theme's identity. */}
            <span
              className="ember"
              style={{
                right: '20%',
                animationDuration: '6s',
                animationDelay: '0.4s',
                ['--ember-drift' as string]: '6px',
                background: 'radial-gradient(circle, #f5d0fe, #c026d3 70%)',
                boxShadow: '0 0 4px 1px rgba(192, 38, 211, 0.5)',
              }}
            />
            <span
              className="ember"
              style={{
                right: '72%',
                animationDuration: '7.5s',
                animationDelay: '2.6s',
                ['--ember-drift' as string]: '-8px',
                background: 'radial-gradient(circle, #fed7aa, #f97316 70%)',
                boxShadow: '0 0 4px 1px rgba(249, 115, 22, 0.5)',
              }}
            />
          </>
        )}

        <div className="relative z-10 flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between gap-2 px-5 pt-5">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="relative flex items-center justify-center">
                {(isAdmin || tier === 3) && (
                  <span
                    className={`torch-glow pointer-events-none absolute inset-0 rounded-xl blur-md ${isAdmin ? 'bg-amber-400' : 'bg-accent-400'}`}
                  />
                )}
                <span
                  className={`relative flex size-9 items-center justify-center rounded-xl shadow-sm ${
                    isAdmin
                      ? 'bg-gradient-to-tl from-amber-500 via-yellow-400 to-amber-600 text-red-950 shadow-amber-500/40 ring-1 ring-amber-600/30 dark:ring-amber-200/50'
                      : tier === 3
                        ? 'bg-gradient-to-tl from-brand-600 via-accent-500 to-accent-400 text-white shadow-accent-500/40 ring-1 ring-accent-200/50'
                        : 'bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white shadow-brand-500/30'
                  }`}
                >
                  {isAdmin ? (
                    <Crown className="size-4.5" strokeWidth={2} />
                  ) : tier === 3 ? (
                    <Gem className="size-4" strokeWidth={2} />
                  ) : (
                    <Sparkles className="size-4" strokeWidth={2} />
                  )}
                </span>
              </span>
              <h1 className={`flex items-baseline gap-1.5 text-base font-bold ${isAdmin ? 'text-red-950 dark:text-amber-50' : 'text-heading'}`}>
                ادیار
                <span className={`text-xs font-medium ${isAdmin ? 'text-red-900/50 dark:text-amber-200/50' : 'text-faint'}`} dir="ltr">
                  Adyar
                </span>
              </h1>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="بستن منو"
              className={`flex size-8 items-center justify-center rounded-lg md:hidden ${
                isAdmin
                  ? 'text-red-900/60 hover:bg-red-900/5 hover:text-red-950 dark:text-amber-200/60 dark:hover:bg-white/5 dark:hover:text-amber-100'
                  : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <X className="size-4.5" strokeWidth={1.75} />
            </button>
          </div>

          {isAdmin && (
            <div className="mx-5 mt-4 flex items-center gap-2 text-red-800/30 dark:text-amber-400/30">
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-red-700/25 dark:to-amber-400/40" />
              <Swords className="size-3.5" strokeWidth={1.5} />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-red-700/25 dark:to-amber-400/40" />
            </div>
          )}

          {user && (
            <div
              className={`mx-5 mt-5 flex items-center gap-2.5 rounded-xl p-3 ${
                isAdmin ? 'bg-red-900/5 ring-1 ring-red-800/10 dark:bg-white/5 dark:ring-amber-400/10' : 'bg-slate-50 dark:bg-slate-800/60'
              }`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isAdmin
                    ? 'bg-gradient-to-tl from-amber-500 to-amber-600 text-red-950 ring-2 ring-amber-600/30 dark:ring-amber-400/40'
                    : tier === 3
                      ? 'bg-gradient-to-tl from-brand-500 to-accent-500 text-white ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-800 ring-accent-400/70 shadow-md shadow-accent-500/30'
                      : tier === 2
                        ? 'bg-brand-600 text-white ring-2 ring-brand-300/70 dark:ring-brand-500/40'
                        : 'bg-brand-600 text-white'
                }`}
              >
                {initials(user.name)}
              </span>
              <div className="min-w-0 text-xs leading-tight">
                <p className={`truncate font-medium ${isAdmin ? 'text-red-950 dark:text-amber-50' : 'text-heading'}`}>{user.name}</p>
                <p className={`flex items-center gap-1 ${isAdmin ? 'text-red-900/60 dark:text-amber-200/50' : 'text-faint'}`}>
                  {roleLabel[user.role]}
                  {user.role === 'ambassador' && (
                    <>
                      {` · سطح ${formatNumber(user.level)}`}
                      {tier >= 2 && (tier === 3 ? <Gem className="size-3 text-accent-500" /> : <Star className="size-3 text-brand-500" />)}
                      <InfoTooltip>
                        سطح بالاتر یعنی می‌تونی هم‌زمان کمپین‌های بیشتری بگیری. با تایید شدن بازدیدهات خودکار ارتقا
                        می‌گیری.
                      </InfoTooltip>
                    </>
                  )}
                  {user.role === 'advertiser' && tier > 1 && (
                    <>
                      {` · سطح ${formatNumber(tier)}`}
                      {tier === 3 ? <Gem className="size-3 text-accent-500" /> : <Star className="size-3 text-brand-500" />}
                      <InfoTooltip>
                        سطح حساب بر اساس مجموع بودجه کمپین‌هایی که تا الان اجرا کردی محاسبه می‌شه و ظاهر پنلت رو
                        ویژه‌تر می‌کنه.
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
                  className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isAdmin
                      ? active
                        ? 'bg-red-800/10 text-red-900 ring-1 ring-red-800/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20'
                        : 'text-red-950/60 hover:bg-red-900/5 hover:text-red-950 dark:text-rose-200/70 dark:hover:bg-white/5 dark:hover:text-amber-100'
                      : active
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                        : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {isAdmin && active && (
                    <span className="absolute inset-y-1.5 right-0 w-0.5 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600" />
                  )}
                  {!isAdmin && tier === 3 && active && (
                    <span className="absolute inset-y-1.5 right-0 w-0.5 rounded-full bg-gradient-to-b from-brand-400 via-accent-400 to-brand-600" />
                  )}
                  <item.icon className="size-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {isAdmin && (
            <div className="mx-4 h-px bg-gradient-to-l from-transparent via-red-700/25 to-transparent dark:via-amber-400/40" />
          )}

          <div className={`flex items-center justify-between gap-2 border-t px-4 py-4 ${isAdmin ? 'border-transparent' : 'border-slate-200/70 dark:border-slate-800/70'}`}>
            <div className="flex items-center gap-1">
              <HoverLabel label="تنظیمات حساب" position="top" align="end">
                <Link
                  to="/settings"
                  className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                    isAdmin
                      ? 'text-red-900/60 hover:bg-red-900/5 hover:text-red-950 dark:text-amber-200/60 dark:hover:bg-white/5 dark:hover:text-amber-100'
                      : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Settings className="size-4" strokeWidth={1.75} />
                </Link>
              </HoverLabel>

              <HoverLabel label="خروج" position="top">
                <button
                  onClick={() => logout()}
                  className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                    isAdmin
                      ? 'text-red-900/60 hover:bg-red-500/10 hover:text-red-600 dark:text-amber-200/60 dark:hover:bg-red-500/10 dark:hover:text-red-400'
                      : 'text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400'
                  }`}
                >
                  <LogOut className="size-4" strokeWidth={1.75} />
                </button>
              </HoverLabel>
            </div>

            <ThemeToggle position="top" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-surface/80 px-4 py-3 backdrop-blur-md md:hidden dark:border-slate-800/70 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="باز کردن منو"
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
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
