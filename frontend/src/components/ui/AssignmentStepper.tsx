import { Check, XCircle } from 'lucide-react'
import type { AssignmentStatus } from '../../types'

const STEPS: { status: AssignmentStatus; label: string }[] = [
  { status: 'assigned', label: 'تخصیص' },
  { status: 'submitted', label: 'ثبت گزارش' },
  { status: 'approved', label: 'تایید' },
]

// 'posted' exists in the status enum but nothing in the app ever
// transitions an assignment to it (the ambassador reports a claimed-view
// count directly, no separate "mark as posted" step) — treated the same
// as 'assigned' here so the stepper never shows a step nothing reaches.
function stepIndex(status: AssignmentStatus): number {
  if (status === 'assigned' || status === 'posted') return 0
  if (status === 'submitted') return 1
  if (status === 'approved') return 2
  return -1
}

/**
 * Visual pipeline for a single assignment's real lifecycle, instead of
 * just a status Badge — so an advertiser scanning a list of ambassadors
 * can see at a glance who's stuck where, not just read a status word.
 */
export function AssignmentStepper({ status }: { status: AssignmentStatus }) {
  if (status === 'rejected' || status === 'expired') {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
        <XCircle className="size-4" />
        {status === 'rejected' ? 'رد شد' : 'مهلت گذشت'}
      </div>
    )
  }

  const current = stepIndex(status)
  // 'approved' is the pipeline's terminal success state, not just "current
  // step reached" — its own node should read as complete too, not merely
  // active, so the whole row reads as fully done.
  const isDone = (i: number) => i < current || (i === current && status === 'approved')

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step.status} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                isDone(i)
                  ? 'bg-emerald-500 text-white'
                  : i === current
                    ? 'bg-brand-500 text-white ring-4 ring-brand-100 dark:ring-brand-500/20'
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
              }`}
            >
              {isDone(i) ? <Check className="size-3" strokeWidth={3} /> : (i + 1).toLocaleString('fa-IR')}
            </span>
            <span className="whitespace-nowrap text-[10px] text-faint">{step.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-1 h-0.5 w-6 shrink-0 rounded-full transition-colors sm:w-10 ${
                isDone(i) ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
