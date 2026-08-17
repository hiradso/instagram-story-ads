import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/DashboardLayout'

export function Dashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-2 text-lg font-bold text-slate-900">خوش اومدی، {user?.name}</h2>
        <p className="text-sm text-slate-500">
          {user?.role === 'advertiser' && 'از اینجا کمپین‌های تبلیغاتی‌ت رو مدیریت می‌کنی.'}
          {user?.role === 'ambassador' && 'از اینجا کمپین‌های تخصیص‌داده‌شده و کیف‌پولت رو می‌بینی.'}
          {user?.role === 'admin' && 'از اینجا کمپین‌ها، سفیرها و بازبینی‌ها رو مدیریت می‌کنی.'}
        </p>
      </div>
    </DashboardLayout>
  )
}
