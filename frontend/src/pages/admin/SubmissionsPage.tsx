import { useEffect, useState, type FormEvent } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  ImageOff,
  Mail,
  ShieldCheck,
  User as UserIcon,
  X,
  XCircle,
} from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import {
  approveSubmission,
  fetchSubmissions,
  fetchSubmissionScreenshot,
  rejectSubmission,
  type PendingSubmission,
  type SubmissionFilters,
} from '../../lib/admin'
import { extractErrorMessage } from '../../lib/errors'
import { submissionStatusIcon, submissionStatusLabel, submissionStatusTone } from '../../lib/labels'
import { staggerStyle } from '../../lib/animation'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { InfoTooltip } from '../../components/ui/Tooltip'
import { Pagination } from '../../components/ui/Pagination'
import { NumberInput, Select } from '../../components/ui/Field'

const statusFilterOptions: { value: NonNullable<SubmissionFilters['status']>; label: string }[] = [
  { value: 'pending', label: 'در انتظار بررسی' },
  { value: 'approved', label: 'تاییدشده' },
  { value: 'rejected', label: 'ردشده' },
  { value: 'all', label: 'همه' },
]

function SubmissionCard({
  submission,
  index,
  onReviewed,
}: {
  submission: PendingSubmission
  index: number
  onReviewed: () => void
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [approvedViews, setApprovedViews] = useState(String(submission.claimed_views))
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    fetchSubmissionScreenshot(submission.id).then((url) => {
      objectUrl = url
      setImageUrl(url)
    })
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [submission.id])

  async function handleApprove() {
    setError(null)
    setSubmitting(true)
    try {
      await approveSubmission(submission.id, Number(approvedViews))
      onReviewed()
    } catch (err) {
      setError(extractErrorMessage(err))
      setSubmitting(false)
    }
  }

  async function handleReject(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await rejectSubmission(submission.id, rejectReason)
      onReviewed()
    } catch (err) {
      setError(extractErrorMessage(err))
      setSubmitting(false)
    }
  }

  const ambassador = submission.campaign_assignment.ambassador
  const campaign = submission.campaign_assignment.campaign
  const StatusIcon = submissionStatusIcon[submission.status]

  return (
    <Card style={staggerStyle(index)} className="animate-fade-in-up grid gap-4 sm:grid-cols-[180px_1fr]">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="اسکرین‌شات بازدید"
          className="aspect-[9/16] w-full rounded-xl bg-slate-50 object-contain ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-800"
        />
      ) : (
        <div className="flex aspect-[9/16] items-center justify-center rounded-xl bg-slate-50 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
          <ImageOff className="size-6 animate-pulse" strokeWidth={1.5} />
        </div>
      )}

      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <h3 className="font-medium text-heading">{campaign.title}</h3>
          {submission.status !== 'pending' && (
            <Badge tone={submissionStatusTone[submission.status]} icon={<StatusIcon className="size-3.5" />}>
              {submissionStatusLabel[submission.status]}
            </Badge>
          )}
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-subtle">
          <span className="flex items-center gap-1.5">
            <UserIcon className="size-3.5 text-faint" />
            {ambassador.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="size-3.5 text-faint" />
            {ambassador.email}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="size-3.5 text-faint" />
            {submission.status === 'approved' && submission.approved_views !== null
              ? `${submission.approved_views.toLocaleString('fa-IR')} بازدید تاییدشده`
              : `${submission.claimed_views.toLocaleString('fa-IR')} بازدید اعلام‌شده`}
          </span>
        </div>

        {submission.status === 'rejected' && submission.rejection_reason && (
          <p className="mb-2 text-sm text-red-600 dark:text-red-400">دلیل رد: {submission.rejection_reason}</p>
        )}

        {error && (
          <p className="mb-2 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}

        {submission.status !== 'pending' ? null : !showRejectForm ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-subtle">
              بازدید تاییدشده:
              <InfoTooltip>
                پیش‌فرض همون عددیه که سفیر اعلام کرده. اگه با عکس هم‌خونی نداره، قبل از تایید اصلاحش کن — دقیقاً
                همین عدد مبنای محاسبه‌ی مبلغ واریزیه.
              </InfoTooltip>
            </label>
            <NumberInput value={approvedViews} onChange={(e) => setApprovedViews(e.target.value)} className="w-24" />
            <Button
              variant="success"
              size="sm"
              onClick={handleApprove}
              loading={submitting}
              icon={<CheckCircle2 className="size-3.5" />}
            >
              تایید
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowRejectForm(true)}
              disabled={submitting}
              icon={<XCircle className="size-3.5 text-red-500" />}
              className="text-red-600 dark:text-red-400"
            >
              رد
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReject} className="flex flex-wrap items-center gap-2">
            <input
              required
              autoFocus
              placeholder="دلیل رد"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <Button type="submit" variant="danger" size="sm" loading={submitting}>
              ثبت رد
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowRejectForm(false)}
              icon={<X className="size-3.5" />}
            >
              انصراف
            </Button>
          </form>
        )}
      </div>
    </Card>
  )
}

export function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<PendingSubmission[] | null>(null)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<NonNullable<SubmissionFilters['status']>>('pending')

  function load() {
    fetchSubmissions({ status, page }).then((res) => {
      setSubmissions(res.data)
      setLastPage(res.last_page)
      setTotal(res.total)
    })
  }

  useEffect(load, [status, page])

  function handleStatusFilterChange(value: NonNullable<SubmissionFilters['status']>) {
    setStatus(value)
    setPage(1)
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-heading">بررسی اسکرین‌شات‌ها</h2>
        <p className="mt-0.5 text-sm text-faint">بازدید ادعاشده رو با اسکرین‌شات تطبیق بده و تایید یا رد کن</p>
      </div>

      <div className="mb-4">
        <Select
          value={status}
          onChange={(e) => handleStatusFilterChange(e.target.value as NonNullable<SubmissionFilters['status']>)}
          className="w-auto"
        >
          {statusFilterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {submissions === null && <Spinner label="در حال بارگذاری..." />}

      {submissions?.length === 0 && (
        <EmptyState
          icon={ShieldCheck}
          title={status === 'pending' ? 'چیزی برای بررسی نیست' : 'موردی پیدا نشد'}
          description={status === 'pending' ? 'همه‌ی اسکرین‌شات‌ها بررسی شدن.' : undefined}
        />
      )}

      <div className="grid gap-4">
        {submissions?.map((s, i) => (
          <SubmissionCard key={s.id} submission={s} index={i} onReviewed={load} />
        ))}
      </div>

      {submissions && submissions.length > 0 && (
        <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />
      )}
    </DashboardLayout>
  )
}
