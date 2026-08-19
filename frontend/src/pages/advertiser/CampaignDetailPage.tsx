import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, Eye, MapPin, Pencil, Tag, Trash2, Wallet } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { deleteCampaign, fetchCampaign } from '../../lib/campaigns'
import { campaignStatusIcon, campaignStatusLabel, campaignStatusTone, formatToman } from '../../lib/labels'
import { storageUrl } from '../../lib/storage'
import { extractErrorMessage } from '../../lib/errors'
import type { Campaign } from '../../types'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { StatTile } from '../../components/ui/StatTile'
import { Spinner } from '../../components/ui/Spinner'

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
        <p className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      </DashboardLayout>
    )
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <Spinner label="در حال بارگذاری..." />
      </DashboardLayout>
    )
  }

  const isDraft = campaign.status === 'draft'
  const StatusIcon = campaignStatusIcon[campaign.status]
  const viewsPct = Math.min(100, Math.round((campaign.views_delivered / campaign.capacity_views) * 100))

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-heading">{campaign.title}</h2>
          <Badge tone={campaignStatusTone[campaign.status]} icon={<StatusIcon className="size-3.5" />}>
            {campaignStatusLabel[campaign.status]}
          </Badge>
        </div>
        {isDraft && (
          <div className="flex gap-2">
            <Link to={`/advertiser/campaigns/${campaign.id}/edit`}>
              <Button variant="secondary" size="sm" icon={<Pencil className="size-3.5" />}>
                ویرایش
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
              icon={<Trash2 className="size-3.5" />}
            >
              حذف
            </Button>
          </div>
        )}
      </div>

      {!isDraft && (
        <p className="mb-4 text-sm text-faint">
          چون این کمپین دیگه پیش‌نویس نیست، فقط ادمین می‌تونه تغییرش بده.
        </p>
      )}

      <div className="animate-fade-in-up grid gap-6 sm:grid-cols-5">
        <Card className="sm:col-span-2">
          <img
            src={storageUrl(campaign.creative_path)}
            alt={campaign.title}
            className="aspect-square w-full rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
          />
        </Card>

        <div className="space-y-4 sm:col-span-3">
          {campaign.description && <Card className="text-sm text-body">{campaign.description}</Card>}

          <div className="grid grid-cols-2 gap-3">
            <StatTile icon={Tag} label="دسته‌بندی" value={campaign.category?.name ?? '—'} />
            <StatTile icon={Wallet} label="قیمت هر ۱۰۰۰ بازدید" value={formatToman(campaign.price_per_1000_views)} />
          </div>

          <Card>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-subtle">
                <Eye className="size-4" />
                بازدید تحویل‌شده
              </span>
              <span className="font-medium text-heading">
                {campaign.views_delivered.toLocaleString('fa-IR')} از{' '}
                {campaign.capacity_views.toLocaleString('fa-IR')}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-l from-brand-500 to-accent-400 transition-all duration-700"
                style={{ width: `${viewsPct}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-subtle">
                <Wallet className="size-4" />
                بودجه باقی‌مونده
              </span>
              <span className="font-medium text-heading">
                {formatToman(campaign.budget_remaining)} از {formatToman(campaign.budget_total)}
              </span>
            </div>
          </Card>

          {campaign.provinces && campaign.provinces.length > 0 && (
            <Card className="flex items-center gap-2 text-sm">
              <MapPin className="size-4 shrink-0 text-faint" />
              <span className="text-subtle">استان‌های هدف:</span>
              <span className="font-medium text-heading">
                {campaign.provinces.map((p) => p.name).join('، ')}
              </span>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
