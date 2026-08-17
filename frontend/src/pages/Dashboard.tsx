import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/DashboardLayout'

export function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'advertiser') {
    return <Navigate to="/advertiser/campaigns" replace />
  }

  if (user?.role === 'ambassador') {
    return <Navigate to="/ambassador/assignments" replace />
  }

  return (
    <DashboardLayout>
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-2 text-lg font-bold text-slate-900">خوش اومدی، {user?.name}</h2>
        <p className="text-sm text-slate-500">
          {user?.role === 'admin' && 'از اینجا کمپین‌ها، سفیرها و بازبینی‌ها رو مدیریت می‌کنی.'}
        </p>
      </div>
    </DashboardLayout>
  )
}
