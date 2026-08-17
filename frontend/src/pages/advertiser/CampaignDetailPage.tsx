import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '../../components/DashboardLayout'
import { deleteCampaign, fetchCampaign } from '../../lib/campaigns'
import { campaignStatusColor, campaignStatusLabel, formatToman } from '../../lib/labels'
import { storageUrl } from '../../lib/storage'
import { extractErrorMessage } from '../../lib/errors'
import type { Campaign } from '../../types'

export function CampaignDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCampaign(Number(id))
      .then(setCampaign)
      .catch(() => setError('نشد کمپین رو بگیریم.'))
  }, [id])

  async function handleDelete() {
    if (!campaign) return
    if (!confirm('مطمئنی می‌خوای این کمپین رو حذف کنی؟')) return

    setDeleting(true)
    try {
      await deleteCampaign(campaign.id)
      navigate('/advertiser/campaigns')
    } catch (err) {
      setError(extractErrorMessage(err))
      setDeleting(false)
    }
  }

  if (error) {
    return (
      <DashboardLayout>
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      </DashboardLayout>
    )
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <p className="text-sm text-slate-500">در حال بارگذاری...</p>
      </DashboardLayout>
    )
  }

  const isDraft = campaign.status === 'draft'

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">{campaign.title}</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${campaignStatusColor[campaign.status]}`}
          >
            {campaignStatusLabel[campaign.status]}
          </span>
        </div>
        {isDraft && (
          <div className="flex gap-2">
            <Link
              to={`/advertiser/campaigns/${campaign.id}/edit`}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              ویرایش
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? 'در حال حذف...' : 'حذف'}
            </button>
          </div>
        )}
      </div>

      {!isDraft && (
        <p className="mb-4 text-sm text-slate-500">
          چون این کمپین دیگه پیش‌نویس نیست، فقط ادمین می‌تونه تغییرش بده.
        </p>
      )}

      <div className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2">
        <img
          src={storageUrl(campaign.creative_path)}
          alt={campaign.title}
          className="aspect-square w-full rounded-xl object-cover ring-1 ring-slate-200"
        />

        <div className="space-y-3 text-sm">
          {campaign.description && <p className="text-slate-600">{campaign.description}</p>}

          <div>
            <p className="text-slate-400">دسته‌بندی</p>
            <p className="font-medium text-slate-900">{campaign.category?.name ?? '—'}</p>
          </div>

          <div>
            <p className="text-slate-400">قیمت هر ۱۰۰۰ بازدید</p>
            <p className="font-medium text-slate-900">{formatToman(campaign.price_per_1000_views)}</p>
          </div>

          <div>
            <p className="text-slate-400">بودجه</p>
            <p className="font-medium text-slate-900">
              {formatToman(campaign.budget_remaining)} از {formatToman(campaign.budget_total)} باقی‌مونده
            </p>
          </div>

          <div>
            <p className="text-slate-400">بازدید</p>
            <p className="font-medium text-slate-900">
              {campaign.views_delivered.toLocaleString('fa-IR')} از{' '}
              {campaign.capacity_views.toLocaleString('fa-IR')} تحویل‌شده
            </p>
          </div>

          {campaign.provinces && campaign.provinces.length > 0 && (
            <div>
              <p className="text-slate-400">استان‌های هدف</p>
              <p className="font-medium text-slate-900">
                {campaign.provinces.map((p) => p.name).join('، ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
