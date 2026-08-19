import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, CheckCircle2, ClipboardCheck, Megaphone, ShieldCheck, Users } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAdminCampaigns, fetchAdminProfiles, fetchPendingSubmissions } from '../../lib/admin'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'

interface Stats {
  pendingSubmissions: number
  activeCampaigns: number
  totalCampaigns: number
  totalAmbassadors: number
  unverifiedAmbassadors: number
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    Promise.all([fetchPendingSubmissions(), fetchAdminCampaigns(), fetchAdminProfiles()]).then(
      ([submissions, campaigns, profiles]) => {
        setStats({
          pendingSubmissions: submissions.total,
          totalCampaigns: campaigns.total,
          activeCampaigns: campaigns.data.filter((c) => c.status === 'active').length,
          totalAmbassadors: profiles.total,
          unverifiedAmbassadors: profiles.data.filter((p) => !p.verified_at).length,
        })
      },
    )
  }, [])

  if (!stats) {
    return (
      <DashboardLayout>
        <Spinner label="در حال بارگذاری..." />
      </DashboardLayout>
    )
  }

  const cards = [
    {
      to: '/admin/submissions',
      icon: ClipboardCheck,
      label: 'در انتظار بررسی',
      value: stats.pendingSubmissions,
      tone: 'from-amber-400 to-orange-400',
      urgent: stats.pendingSubmissions > 0,
    },
    {
      to: '/admin/campaigns',
      icon: CheckCircle2,
      label: 'کمپین فعال',
      value: stats.activeCampaigns,
      tone: 'from-emerald-400 to-teal-400',
    },
    {
      to: '/admin/campaigns',
      icon: Megaphone,
      label: 'کل کمپین‌ها',
      value: stats.totalCampaigns,
      tone: 'from-brand-500 to-accent-400',
    },
    {
      to: '/admin/profiles',
      icon: Users,
      label: 'کل سفیرها',
      value: stats.totalAmbassadors,
      tone: 'from-blue-400 to-indigo-400',
    },
    {
      to: '/admin/profiles',
      icon: BadgeCheck,
      label: 'در انتظار تایید پروفایل',
      value: stats.unverifiedAmbassadors,
      tone: 'from-pink-400 to-fuchsia-400',
      urgent: stats.unverifiedAmbassadors > 0,
    },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tl from-brand-600 to-accent-500 text-white">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-heading">داشبورد ادمین</h2>
          <p className="text-sm text-faint">نمای کلی وضعیت پلتفرم</p>
        </div>
      </div>

      <div className="grid animate-fade-in-up gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} to={card.to}>
            <Card hover className="group relative overflow-hidden">
              {card.urgent && card.value > 0 && (
                <span className="absolute top-4 left-4 size-2 animate-pulse rounded-full bg-red-500" />
              )}
              <div className="flex items-center justify-between">
                <span
                  className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ${card.tone}`}
                >
                  <card.icon className="size-5" strokeWidth={1.75} />
                </span>
                <ArrowLeft className="size-4 text-slate-300 transition-transform dark:text-slate-600 group-hover:-translate-x-0.5" />
              </div>
              <p className="mt-3 text-2xl font-bold text-heading">{card.value.toLocaleString('fa-IR')}</p>
              <p className="text-sm text-faint">{card.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  )
}
