import { useEffect, useState, type FormEvent } from 'react'
import { AlertCircle, BadgeCheck, CheckCircle2, Mail, User as UserIcon, Wallet, X, XCircle } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import {
  approveWithdrawal,
  fetchAdminWithdrawals,
  markWithdrawalPaid,
  rejectWithdrawal,
} from '../../lib/admin'
import { extractErrorMessage } from '../../lib/errors'
import { formatToman, withdrawalStatusLabel, withdrawalStatusTone } from '../../lib/labels'
import { staggerStyle } from '../../lib/animation'
import type { User, WithdrawalRequest } from '../../types'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'

interface Row extends WithdrawalRequest {
  user: User
}

function WithdrawalCard({ withdrawal, index, onChanged }: { withdrawal: Row; index: number; onChanged: () => void }) {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleApprove() {
    setError(null)
    setSubmitting(true)
    try {
      await approveWithdrawal(withdrawal.id)
      onChanged()
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
      await rejectWithdrawal(withdrawal.id, rejectReason)
      onChanged()
    } catch (err) {
      setError(extractErrorMessage(err))
      setSubmitting(false)
    }
  }

  async function handleMarkPaid() {
    setError(null)
    setSubmitting(true)
    try {
      await markWithdrawalPaid(withdrawal.id)
      onChanged()
    } catch (err) {
      setError(extractErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <Card style={staggerStyle(index)} className="animate-fade-in-up flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <h3 className="font-medium text-heading">{formatToman(withdrawal.amount)}</h3>
          <Badge tone={withdrawalStatusTone[withdrawal.status]}>{withdrawalStatusLabel[withdrawal.status]}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-subtle">
          <span className="flex items-center gap-1.5">
            <UserIcon className="size-3.5 text-faint" />
            {withdrawal.user.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="size-3.5 text-faint" />
            {withdrawal.user.email}
          </span>
        </div>
        {withdrawal.admin_note && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{withdrawal.admin_note}</p>}
        {error && (
          <p className="mt-2 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {withdrawal.status === 'pending' && !showRejectForm && (
        <div className="flex items-center gap-2">
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
      )}

      {withdrawal.status === 'pending' && showRejectForm && (
        <form onSubmit={handleReject} className="flex flex-1 items-center gap-2 sm:flex-initial">
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

      {withdrawal.status === 'approved' && (
        <Button size="sm" onClick={handleMarkPaid} loading={submitting} icon={<BadgeCheck className="size-3.5" />}>
          ثبت پرداخت
        </Button>
      )}
    </Card>
  )
}

export function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Row[] | null>(null)

  function load() {
    fetchAdminWithdrawals().then((res) => setWithdrawals(res.data as Row[]))
  }

  useEffect(load, [])

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-heading">درخواست‌های برداشت وجه</h2>
        <p className="mt-0.5 text-sm text-faint">درخواست‌های سفیرها برای برداشت از کیف‌پول رو بررسی و پردازش کن</p>
      </div>

      {withdrawals === null && <Spinner label="در حال بارگذاری..." />}

      {withdrawals?.length === 0 && (
        <EmptyState icon={Wallet} title="هیچ درخواستی ثبت نشده" description="وقتی سفیری درخواست برداشت بده، اینجا نشون داده می‌شه." />
      )}

      <div className="grid gap-4">
        {withdrawals?.map((w, i) => (
          <WithdrawalCard key={w.id} withdrawal={w} index={i} onChanged={load} />
        ))}
      </div>
    </DashboardLayout>
  )
}
