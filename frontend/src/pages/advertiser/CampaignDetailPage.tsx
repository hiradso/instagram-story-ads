import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, Eye, Link2, MapPin, Pencil, Tag, Target, Trash2, Users, Wallet } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { deleteCampaign, fetchCampaign } from '../../lib/campaigns'
import {
  assignmentStatusIcon,
  assignmentStatusLabel,
  assignmentStatusTone,
  campaignStatusIcon,
  campaignStatusLabel,
  campaignStatusTone,
  formatNumber,
  formatToman,
} from '../../lib/labels'
import { storageUrl } from '../../lib/storage'
import { extractErrorMessage } from '../../lib/errors'
import type { Campaign, CampaignAssignmentWithAmbassador } from '../../types'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { StatTile } from '../../components/ui/StatTile'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { UtmLinkBuilder } from '../../components/ui/UtmLinkBuilder'

function AssignmentRow({ assignment }: { assignment: CampaignAssignmentWithAmbassador }) {
  const StatusIcon = assignmentStatusIcon[assignment.status]
  const submission = assignment.view_submission

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-heading">{assignment.ambassador.name}</span>
          {assignment.ambassador.ambassador_profile && (
            <a
              href={assignment.ambassador.ambassador_profile.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-subtle hover:text-brand-600 dark:hover:text-brand-400"
            >
              <Link2 className="size-3.5" />@{assignment.ambassador.ambassador_profile.instagram_username}
            </a>
          )}
        </div>
        {submission && (
          <p className="mt-0.5 text-sm text-faint">
            {submission.approved_views !== null
              ? `${submission.approved_views.toLocaleString('fa-IR')} بازدید تاییدشده`
              : `${submission.claimed_views.toLocaleString('fa-IR')} بازدید اعلام‌شده`}
            {submission.status === 'rejected' && submission.rejection_reason && ` — ${submission.rejection_reason}`}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {assignment.ambassador.ambassador_profile?.engagement_rate !== null &&
          assignment.ambassador.ambassador_profile?.engagement_rate !== undefined && (
            <span
              title="نرخ تعامل اجتماعی این سفیر"
              className="flex items-center gap-1 text-xs text-subtle"
            >
              <Target className="size-3" />٪{formatNumber(assignment.ambassador.ambassador_profile.engagement_rate)}
            </span>
          )}
        <Badge tone={assignmentStatusTone[assignment.status]} icon={<StatusIcon className="size-3.5" />}>
          {assignmentStatusLabel[assignment.status]}
        </Badge>
      </div>
    </div>
  )
}

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

  // Real, per-assignment engagement rates the ambassadors reported on
  // their own profile — averaged only over the ones who actually filled
  // it in, not assumed for the rest.
  const engagementRates = (campaign.assignments ?? [])
    .map((a) => a.ambassador.ambassador_profile?.engagement_rate)
    .filter((rate): rate is string => rate !== null && rate !== undefined)
    .map(Number)
  const avgEngagementRate =
    engagementRates.length > 0 ? engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length : null

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-heading">{campaign.title}</h2>
          <Badge tone={campaignStatusTone[campaign.status]} icon={<StatusIcon className="size-3.5" />}>
            {campaignStatusLabel[campaign.status]}
          </Badge>
          {campaign.assignment_mode === 'manual' && <Badge tone="blue">تخصیص دستی</Badge>}
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
            {avgEngagementRate !== null && (
              <StatTile
                icon={Target}
                label="میانگین نرخ تعامل سفیرها"
                value={`٪${formatNumber(avgEngagementRate)}`}
              />
            )}
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

          <UtmLinkBuilder defaultCampaign={campaign.title} defaultSource="advertiser" />
        </div>
      </div>

      <div className="animate-fade-in-up mt-6">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-heading">
          <Users className="size-4 text-faint" />
          سفیرهای تخصیص‌داده‌شده
        </h3>

        {(!campaign.assignments || campaign.assignments.length === 0) && (
          <EmptyState
            icon={Users}
            title="هنوز هیچ سفیری تخصیص داده نشده"
            description={
              campaign.assignment_mode === 'manual'
                ? 'این کمپین با روش دستی کار می‌کنه — از صفحه‌ی «پیدا کردن سفیر» با یکی گفت‌وگو کن و توافق کن.'
                : 'وقتی موتور تخصیص کمپینت رو به سفیرها اختصاص بده، اینجا نشون داده می‌شن.'
            }
            action={
              campaign.assignment_mode === 'manual' ? (
                <Link to="/advertiser/ambassadors">
                  <Button size="sm">پیدا کردن سفیر</Button>
                </Link>
              ) : undefined
            }
          />
        )}

        {campaign.assignments && campaign.assignments.length > 0 && (
          <Card>
            {campaign.assignments.map((a) => (
              <AssignmentRow key={a.id} assignment={a} />
            ))}
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
