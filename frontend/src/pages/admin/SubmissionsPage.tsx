import { useEffect, useState, type FormEvent } from 'react'
import { DashboardLayout } from '../../components/DashboardLayout'
import {
  approveSubmission,
  fetchPendingSubmissions,
  fetchSubmissionScreenshot,
  rejectSubmission,
  type PendingSubmission,
} from '../../lib/admin'
import { extractErrorMessage } from '../../lib/errors'

function SubmissionCard({ submission, onReviewed }: { submission: PendingSubmission; onReviewed: () => void }) {
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

  return (
    <div className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-[200px_1fr]">
      {imageUrl ? (
        <img src={imageUrl} alt="اسکرین‌شات بازدید" className="w-full rounded-lg object-cover ring-1 ring-slate-200" />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg bg-slate-50 text-xs text-slate-400">
          در حال بارگذاری تصویر...
        </div>
      )}

      <div>
        <h3 className="font-medium text-slate-900">{campaign.title}</h3>
        <p className="mb-2 text-sm text-slate-500">
          سفیر: {ambassador.name} ({ambassador.email}) · بازدید اعلام‌شده:{' '}
          {submission.claimed_views.toLocaleString('fa-IR')}
        </p>

        {error && <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {!showRejectForm ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-slate-500">بازدید تاییدشده:</label>
            <input
              type="number"
              min={1}
              value={approvedViews}
              onChange={(e) => setApprovedViews(e.target.value)}
              className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-500"
            />
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              تایید
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={submitting}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
            >
              رد
            </button>
          </div>
        ) : (
          <form onSubmit={handleReject} className="flex flex-wrap items-center gap-2">
            <input
              required
              placeholder="دلیل رد"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              ثبت رد
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600"
            >
              انصراف
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<PendingSubmission[] | null>(null)

  function load() {
    fetchPendingSubmissions().then((res) => setSubmissions(res.data))
  }

  useEffect(load, [])

  return (
    <DashboardLayout>
      <h2 className="mb-6 text-lg font-bold text-slate-900">اسکرین‌شات‌های در انتظار بررسی</h2>

      {submissions?.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">چیزی برای بررسی نیست.</p>
        </div>
      )}

      <div className="grid gap-4">
        {submissions?.map((s) => (
          <SubmissionCard key={s.id} submission={s} onReviewed={load} />
        ))}
      </div>
    </DashboardLayout>
  )
}
