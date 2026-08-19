import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Camera,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Sparkles,
  User,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { formatNumber } from '../lib/labels'
import { InfoTooltip } from './ui/Tooltip'
import { ThemeToggle } from './ui/ThemeToggle'

const roleLabel: Record<string, string> = {
  admin: 'ادمین',
  advertiser: 'آگهی‌دهنده',
  ambassador: 'سفیر',
}

interface NavItem {
  to: string
  label: string
  icon: typeof Camera
}

const navByRole: Record<string, NavItem[]> = {
  advertiser: [{ to: '/advertiser/campaigns', label: 'کمپین‌ها', icon: Megaphone }],
  ambassador: [
    { to: '/ambassador/assignments', label: 'کمپین‌های من', icon: Camera },
    { to: '/ambassador/profile', label: 'پروفایل', icon: User },
  ],
  admin: [
    { to: '/admin', label: 'داشبورد', icon: LayoutDashboard },
    { to: '/admin/submissions', label: 'بازبینی اسکرین‌شات‌ها', icon: ClipboardCheck },
    { to: '/admin/campaigns', label: 'کمپین‌ها', icon: Megaphone },
    { to: '/admin/profiles', label: 'سفیرها', icon: Users },
  ],
}

function initials(name: string) {
  return name.trim().slice(0, 1)
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const items = user ? navByRole[user.role] ?? [] : []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-1">
            <Link to="/" className="ml-5 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white shadow-sm shadow-brand-500/30">
                <Sparkles className="size-4" strokeWidth={2} />
              </span>
              <h1 className="text-base font-bold text-heading">استوری‌یار</h1>
            </Link>

            <nav className="flex items-center gap-1">
              {items.map((item) => {
                const active =
                  item.to === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <item.icon className="size-4" strokeWidth={active ? 2.25 : 1.75} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-tl from-brand-500 to-accent-400 text-xs font-bold text-white">
                  {initials(user.name)}
                </span>
                <div className="hidden text-xs leading-tight sm:block">
                  <p className="font-medium text-heading">{user.name}</p>
                  <p className="flex items-center gap-1 text-faint">
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

            <ThemeToggle />

            <button
              onClick={() => logout()}
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              title="خروج"
            >
              <LogOut className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  )
}
