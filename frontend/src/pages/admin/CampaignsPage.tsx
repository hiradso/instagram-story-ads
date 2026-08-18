import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAdminCampaigns, updateCampaignStatus } from '../../lib/admin'
import { campaignStatusColor, campaignStatusLabel, formatToman } from '../../lib/labels'
import { extractErrorMessage } from '../../lib/errors'
import type { Campaign, CampaignStatus } from '../../types'

const nextActions: Partial<Record<CampaignStatus, { label: string; to: CampaignStatus }[]>> = {
  draft: [
    { label: 'فعال‌سازی', to: 'active' },
    { label: 'رد کردن', to: 'cancelled' },
  ],
  pending_review: [
    { label: 'فعال‌سازی', to: 'active' },
    { label: 'رد کردن', to: 'cancelled' },
  ],
  active: [
    { label: 'توقف', to: 'paused' },
    { label: 'اتمام', to: 'completed' },
  ],
  paused: [{ label: 'ازسرگیری', to: 'active' }],
}

export function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  function load() {
    fetchAdminCampaigns().then((res) => setCampaigns(res.data))
  }

  useEffect(load, [])

  async function handleStatusChange(campaign: Campaign, status: CampaignStatus) {
    setError(null)
    setBusyId(campaign.id)
    try {
      await updateCampaignStatus(campaign.id, status)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <h2 className="mb-6 text-lg font-bold text-slate-900">همه‌ی کمپین‌ها</h2>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4">
        {campaigns?.map((campaign) => (
          <div
            key={campaign.id}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
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
                بودجه: {formatToman(campaign.budget_total)} · بازدید:{' '}
                {campaign.views_delivered.toLocaleString('fa-IR')} از{' '}
                {campaign.capacity_views.toLocaleString('fa-IR')}
              </p>
            </div>

            <div className="flex gap-2">
              {(nextActions[campaign.status] ?? []).map((action) => (
                <button
                  key={action.to}
                  onClick={() => handleStatusChange(campaign, action.to)}
                  disabled={busyId === campaign.id}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
