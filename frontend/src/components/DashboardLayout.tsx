import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatNumber } from '../lib/labels'

const roleLabel: Record<string, string> = {
  admin: 'ادمین',
  advertiser: 'آگهی‌دهنده',
  ambassador: 'سفیر',
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-6">
          <Link to="/">
            <h1 className="text-lg font-bold text-slate-900">استوری‌یار</h1>
          </Link>
          {user?.role === 'advertiser' && (
            <Link to="/advertiser/campaigns" className="text-sm text-slate-600 hover:text-slate-900">
              کمپین‌ها
            </Link>
          )}
          {user?.role === 'ambassador' && (
            <>
              <Link to="/ambassador/assignments" className="text-sm text-slate-600 hover:text-slate-900">
                کمپین‌های من
              </Link>
              <Link to="/ambassador/profile" className="text-sm text-slate-600 hover:text-slate-900">
                پروفایل
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/submissions" className="text-sm text-slate-600 hover:text-slate-900">
                بازبینی اسکرین‌شات‌ها
              </Link>
              <Link to="/admin/campaigns" className="text-sm text-slate-600 hover:text-slate-900">
                کمپین‌ها
              </Link>
              <Link to="/admin/profiles" className="text-sm text-slate-600 hover:text-slate-900">
                سفیرها
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <p className="text-xs text-slate-500">
              {user.name} · {roleLabel[user.role]}
              {user.role === 'ambassador' && ` · سطح ${formatNumber(user.level)}`}
            </p>
          )}
          <button
            onClick={() => logout()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            خروج
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  )
}
