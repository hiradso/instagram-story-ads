import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Eye, Megaphone, Plus, Wallet } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchCampaigns } from '../../lib/campaigns'
import { campaignStatusIcon, campaignStatusLabel, campaignStatusTone, formatToman } from '../../lib/labels'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import type { Campaign } from '../../types'

export function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
      .then((res) => setCampaigns(res.data))
      .catch(() => setError('نشد کمپین‌ها رو بگیریم، دوباره امتحان کن.'))
  }, [])

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">کمپین‌های من</h2>
          <p className="mt-0.5 text-sm text-slate-400">مدیریت و پیگیری کمپین‌های تبلیغاتی</p>
        </div>
        <Link to="/advertiser/campaigns/new">
          <Button icon={<Plus className="size-4" />}>کمپین جدید</Button>
        </Link>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {campaigns === null && !error && <Spinner label="در حال بارگذاری کمپین‌ها..." />}

      {campaigns?.length === 0 && (
        <EmptyState
          icon={Megaphone}
          title="هنوز کمپینی نساختی"
          description="اولین کمپین تبلیغاتی‌ت رو بساز تا سفیرها بتونن استوریت رو منتشر کنن."
          action={
            <Link to="/advertiser/campaigns/new">
              <Button size="sm" icon={<Plus className="size-4" />}>
                ساخت کمپین
              </Button>
            </Link>
          }
        />
      )}

      <div className="grid gap-3">
        {campaigns?.map((campaign) => {
          const StatusIcon = campaignStatusIcon[campaign.status]
          return (
            <Link key={campaign.id} to={`/advertiser/campaigns/${campaign.id}`}>
              <Card hover className="animate-fade-in-up group flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <h3 className="truncate font-medium text-slate-900">{campaign.title}</h3>
                    <Badge tone={campaignStatusTone[campaign.status]} icon={<StatusIcon className="size-3.5" />}>
                      {campaignStatusLabel[campaign.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="size-3.5 text-slate-400" />
                      {formatToman(campaign.budget_total)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="size-3.5 text-slate-400" />
                      {campaign.views_delivered.toLocaleString('fa-IR')} از{' '}
                      {campaign.capacity_views.toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
                <ArrowLeft className="size-4 shrink-0 text-slate-300 transition-transform group-hover:-translate-x-0.5" />
              </Card>
            </Link>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
