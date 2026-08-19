import { useEffect, useState } from 'react'
import { AlertCircle, Ban, CheckCircle2, Megaphone, PauseCircle, PlayCircle, Search } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAdminCampaigns, updateCampaignStatus } from '../../lib/admin'
import { campaignStatusIcon, campaignStatusLabel, campaignStatusTone, formatToman } from '../../lib/labels'
import { extractErrorMessage } from '../../lib/errors'
import type { Campaign, CampaignStatus } from '../../types'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { Pagination } from '../../components/ui/Pagination'
import { Select, TextInput } from '../../components/ui/Field'

const statusFilterOptions: { value: CampaignStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'همه‌ی وضعیت‌ها' },
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'pending_review', label: 'در انتظار بررسی' },
  { value: 'active', label: 'فعال' },
  { value: 'paused', label: 'متوقف‌شده' },
  { value: 'completed', label: 'تمام‌شده' },
  { value: 'cancelled', label: 'لغوشده' },
]

const nextActions: Partial<
  Record<CampaignStatus, { label: string; to: CampaignStatus; variant: 'success' | 'secondary' | 'danger' }[]>
> = {
  draft: [
    { label: 'فعال‌سازی', to: 'active', variant: 'success' },
    { label: 'رد کردن', to: 'cancelled', variant: 'danger' },
  ],
  pending_review: [
    { label: 'فعال‌سازی', to: 'active', variant: 'success' },
    { label: 'رد کردن', to: 'cancelled', variant: 'danger' },
  ],
  active: [
    { label: 'توقف', to: 'paused', variant: 'secondary' },
    { label: 'اتمام', to: 'completed', variant: 'secondary' },
  ],
  paused: [{ label: 'ازسرگیری', to: 'active', variant: 'success' }],
}

const actionIcon: Record<CampaignStatus, typeof PlayCircle> = {
  draft: PlayCircle,
  pending_review: PlayCircle,
  active: PlayCircle,
  paused: PlayCircle,
  completed: CheckCircle2,
  cancelled: Ban,
}

export function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<CampaignStatus | 'all'>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  function load() {
    fetchAdminCampaigns({ status, search: search || undefined, page }).then((res) => {
      setCampaigns(res.data)
      setLastPage(res.last_page)
      setTotal(res.total)
    })
  }

  useEffect(load, [status, search, page])

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  function handleStatusFilterChange(value: CampaignStatus | 'all') {
    setStatus(value)
    setPage(1)
  }

  async function handleStatusChange(campaign: Campaign, newStatus: CampaignStatus) {
    setError(null)
    setBusyId(campaign.id)
    try {
      await updateCampaignStatus(campaign.id, newStatus)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-heading">همه‌ی کمپین‌ها</h2>
        <p className="mt-0.5 text-sm text-faint">فعال‌سازی، توقف و پیگیری پیشرفت کمپین‌ها</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <TextInput
          icon={Search}
          placeholder="جست‌وجوی عنوان کمپین..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => handleStatusFilterChange(e.target.value as CampaignStatus | 'all')}
          className="w-auto"
        >
          {statusFilterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {campaigns === null && <Spinner label="در حال بارگذاری..." />}

      {campaigns?.length === 0 && (
        <EmptyState
          icon={Megaphone}
          title={status !== 'all' || search ? 'کمپینی با این فیلتر پیدا نشد' : 'هنوز کمپینی ثبت نشده'}
        />
      )}

      <div className="grid gap-4">
        {campaigns?.map((campaign) => {
          const StatusIcon = campaignStatusIcon[campaign.status]
          const viewsPct = Math.min(100, Math.round((campaign.views_delivered / campaign.capacity_views) * 100))
          return (
            <Card key={campaign.id} className="animate-fade-in-up">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <h3 className="truncate font-medium text-heading">{campaign.title}</h3>
                    <Badge tone={campaignStatusTone[campaign.status]} icon={<StatusIcon className="size-3.5" />}>
                      {campaignStatusLabel[campaign.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-subtle">
                    بودجه: {formatToman(campaign.budget_total)} · بازدید:{' '}
                    {campaign.views_delivered.toLocaleString('fa-IR')} از{' '}
                    {campaign.capacity_views.toLocaleString('fa-IR')}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {(nextActions[campaign.status] ?? []).map((action) => {
                    const ActionIcon = action.to === 'cancelled' ? Ban : action.to === 'paused' ? PauseCircle : actionIcon[action.to]
                    return (
                      <Button
                        key={action.to}
                        variant={action.variant}
                        size="sm"
                        onClick={() => handleStatusChange(campaign, action.to)}
                        loading={busyId === campaign.id}
                        icon={<ActionIcon className="size-3.5" />}
                      >
                        {action.label}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {campaign.status !== 'draft' && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-brand-500 to-accent-400 transition-all duration-700"
                    style={{ width: `${viewsPct}%` }}
                  />
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {campaigns && campaigns.length > 0 && (
        <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />
      )}
    </DashboardLayout>
  )
}
