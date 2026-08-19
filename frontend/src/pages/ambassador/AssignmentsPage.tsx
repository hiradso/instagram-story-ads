import { useEffect, useState, type FormEvent } from 'react'
import { AlertCircle, Camera, CheckCircle2, Clock, ImagePlus, Upload, XCircle } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAssignments, submitScreenshot } from '../../lib/ambassador'
import { assignmentStatusIcon, assignmentStatusLabel, assignmentStatusTone, submissionStatusLabel } from '../../lib/labels'
import { extractErrorMessage } from '../../lib/errors'
import type { CampaignAssignment } from '../../types'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'

function AssignmentCard({
  assignment,
  onSubmitted,
}: {
  assignment: CampaignAssignment
  onSubmitted: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [claimedViews, setClaimedViews] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = ['assigned', 'posted'].includes(assignment.status) && !assignment.view_submission
  const StatusIcon = assignmentStatusIcon[assignment.status]
  const submission = assignment.view_submission

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('اول اسکرین‌شات رو انتخاب کن.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await submitScreenshot(assignment.id, file, Number(claimedViews))
      onSubmitted()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="animate-fade-in-up">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-accent-400/10 text-brand-500 ring-1 ring-slate-200/70 dark:ring-slate-800">
            <Camera className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <h3 className="font-medium text-heading">{assignment.campaign.title}</h3>
            <p className="flex items-center gap-1 text-xs text-faint">
              <Clock className="size-3" />
              مهلت تا {new Date(assignment.post_deadline_at).toLocaleString('fa-IR')}
            </p>
          </div>
        </div>
        <Badge tone={assignmentStatusTone[assignment.status]} icon={<StatusIcon className="size-3.5" />}>
          {assignmentStatusLabel[assignment.status]}
        </Badge>
      </div>

      {submission && (
        <div className="animate-fade-in space-y-1 rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-600 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-800">
          <p className="flex items-center gap-1.5">
            {submission.status === 'approved' && <CheckCircle2 className="size-3.5 text-emerald-500" />}
            {submission.status === 'rejected' && <XCircle className="size-3.5 text-red-500" />}
            {submission.status === 'pending' && <Clock className="size-3.5 text-amber-500" />}
            وضعیت بررسی: {submissionStatusLabel[submission.status]}
          </p>
          <p>بازدید اعلام‌شده: {submission.claimed_views.toLocaleString('fa-IR')}</p>
          {submission.approved_views !== null && (
            <p>بازدید تاییدشده: {submission.approved_views.toLocaleString('fa-IR')}</p>
          )}
          {submission.rejection_reason && <p className="text-red-600 dark:text-red-400">دلیل رد: {submission.rejection_reason}</p>}
        </div>
      )}

      {canSubmit && (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-2.5">
          {error && (
            <p className="flex w-full items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="size-3.5 shrink-0" />
              {error}
            </p>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 transition-colors hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10">
            <ImagePlus className="size-4" />
            {file ? file.name : 'انتخاب اسکرین‌شات'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
          <input
            type="number"
            min={1}
            required
            placeholder="تعداد بازدید"
            value={claimedViews}
            onChange={(e) => setClaimedViews(e.target.value)}
            className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <Button type="submit" size="sm" loading={submitting} icon={<Upload className="size-3.5" />}>
            ثبت
          </Button>
        </form>
      )}
    </Card>
  )
}

export function AssignmentsPage() {
  const [assignments, setAssignments] = useState<CampaignAssignment[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function load() {
    fetchAssignments()
      .then((res) => setAssignments(res.data))
      .catch(() => setError('نشد کمپین‌ها رو بگیریم.'))
  }

  useEffect(load, [])

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-heading">کمپین‌های تخصیص‌داده‌شده</h2>
        <p className="mt-0.5 text-sm text-faint">استوری‌هات رو منتشر کن و اسکرین‌شات بازدید رو ثبت کن</p>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {assignments === null && !error && <Spinner label="در حال بارگذاری..." />}

      {assignments?.length === 0 && (
        <EmptyState
          icon={Camera}
          title="هنوز کمپینی بهت تخصیص داده نشده"
          description="وقتی موتور تخصیص یه کمپین مناسب پیدا کنه، اینجا نشون داده می‌شه."
        />
      )}

      <div className="grid gap-4">
        {assignments?.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} onSubmitted={load} />
        ))}
      </div>
    </DashboardLayout>
  )
}
