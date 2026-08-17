import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

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
        <div>
          <h1 className="text-lg font-bold text-slate-900">استوری‌یار</h1>
          {user && (
            <p className="text-xs text-slate-500">
              {user.name} · {roleLabel[user.role]}
              {user.role === 'ambassador' && ` · سطح ${user.level}`}
            </p>
          )}
        </div>
        <button
          onClick={() => logout()}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          خروج
        </button>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  )
}
