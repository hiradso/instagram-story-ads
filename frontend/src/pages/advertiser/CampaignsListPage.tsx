import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchCampaigns } from '../../lib/campaigns'
import { campaignStatusColor, campaignStatusLabel, formatToman } from '../../lib/labels'
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
        <h2 className="text-lg font-bold text-slate-900">کمپین‌های من</h2>
        <Link
          to="/advertiser/campaigns/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          کمپین جدید
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {campaigns === null && !error && <p className="text-sm text-slate-500">در حال بارگذاری...</p>}

      {campaigns?.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">هنوز کمپینی نساختی.</p>
        </div>
      )}

      <div className="grid gap-4">
        {campaigns?.map((campaign) => (
          <Link
            key={campaign.id}
            to={`/advertiser/campaigns/${campaign.id}`}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:ring-slate-300"
          >
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-medium text-slate-900">{campaign.title}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${campaignStatusColor[campaign.status]}`}
                >
                  {campaignStatusLabel[campaign.status]}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                بودجه: {formatToman(campaign.budget_total)} · بازدید تحویل‌شده:{' '}
                {campaign.views_delivered.toLocaleString('fa-IR')} از {campaign.capacity_views.toLocaleString('fa-IR')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  )
}
