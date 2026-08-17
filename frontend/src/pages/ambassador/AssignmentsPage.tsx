import { useEffect, useState, type FormEvent } from 'react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAssignments, submitScreenshot } from '../../lib/ambassador'
import { assignmentStatusColor, assignmentStatusLabel, submissionStatusLabel } from '../../lib/labels'
import { extractErrorMessage } from '../../lib/errors'
import type { CampaignAssignment } from '../../types'

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
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-slate-900">{assignment.campaign.title}</h3>
          <p className="text-xs text-slate-400">
            دسته‌بندی: {assignment.campaign.category?.name ?? '—'} · مهلت ثبت اسکرین‌شات تا{' '}
            {new Date(assignment.post_deadline_at).toLocaleString('fa-IR')}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${assignmentStatusColor[assignment.status]}`}
        >
          {assignmentStatusLabel[assignment.status]}
        </span>
      </div>

      {assignment.view_submission && (
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <p>وضعیت بررسی: {submissionStatusLabel[assignment.view_submission.status]}</p>
          <p>بازدید اعلام‌شده: {assignment.view_submission.claimed_views.toLocaleString('fa-IR')}</p>
          {assignment.view_submission.approved_views !== null && (
            <p>بازدید تاییدشده: {assignment.view_submission.approved_views.toLocaleString('fa-IR')}</p>
          )}
          {assignment.view_submission.rejection_reason && (
            <p className="text-red-600">دلیل رد: {assignment.view_submission.rejection_reason}</p>
          )}
        </div>
      )}

      {canSubmit && (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-2">
          {error && <p className="w-full text-sm text-red-600">{error}</p>}
          <div>
            <label className="mb-1 block text-xs text-slate-500">اسکرین‌شات آمار بازدید</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">تعداد بازدید</label>
            <input
              type="number"
              min={1}
              required
              value={claimedViews}
              onChange={(e) => setClaimedViews(e.target.value)}
              className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'در حال ارسال...' : 'ثبت'}
          </button>
        </form>
      )}
    </div>
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
      <h2 className="mb-6 text-lg font-bold text-slate-900">کمپین‌های تخصیص‌داده‌شده</h2>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {assignments?.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">
            هنوز کمپینی بهت تخصیص داده نشده. وقتی موتور تخصیص یه کمپین مناسب پیدا کنه، اینجا نشون داده
            می‌شه.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {assignments?.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} onSubmitted={load} />
        ))}
      </div>
    </DashboardLayout>
  )
}
