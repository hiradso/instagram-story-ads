import { Navigate, Outlet } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: UserRole[] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <span className="loader-story size-14">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white shadow-sm shadow-brand-500/30">
            <Sparkles className="size-4" strokeWidth={2} />
          </span>
        </span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
