import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowDownToLine, Send, Wallet } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchProfile, fetchWithdrawals, requestWithdrawal } from '../../lib/ambassador'
import { extractErrorMessage } from '../../lib/errors'
import { formatToman, withdrawalStatusLabel, withdrawalStatusTone } from '../../lib/labels'
import type { AmbassadorProfile, WithdrawalRequest } from '../../types'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Label, NumberInput } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'

const MIN_WITHDRAWAL = 100000

export function WalletPage() {
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null)
  const [profileMissing, setProfileMissing] = useState(false)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[] | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function load() {
    fetchProfile()
      .then(setProfile)
      .catch(() => setProfileMissing(true))
    fetchWithdrawals().then((res) => setWithdrawals(res.data))
  }

  useEffect(load, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await requestWithdrawal(Number(amount))
      setAmount('')
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const balance = profile ? Number(profile.wallet_balance) : 0
  const canWithdraw = Number(amount) > 0 && Number(amount) <= balance && Number(amount) >= MIN_WITHDRAWAL

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-heading">کیف‌پول</h2>
        <p className="mt-0.5 text-sm text-faint">موجودیت رو ببین و درخواست برداشت وجه بده</p>
      </div>

      {profileMissing ? (
        <EmptyState
          icon={Wallet}
          title="اول پروفایلت رو تکمیل کن"
          description="برای دیدن کیف‌پول و درخواست برداشت، باید اول اطلاعات پیج اینستاگرامت رو ثبت کنی."
          action={
            <Link to="/ambassador/profile">
              <Button size="sm">تکمیل پروفایل</Button>
            </Link>
          }
        />
      ) : !profile ? (
        <Spinner label="در حال بارگذاری..." />
      ) : (
        <div className="animate-fade-in-up space-y-4">
          <Card className="flex items-center gap-3 bg-brand-50 dark:bg-brand-500/10">
            <span className="flex size-10 items-center justify-center rounded-xl bg-surface text-brand-500 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:text-brand-400 dark:ring-slate-700">
              <Wallet className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-xs text-faint">موجودی کیف‌پول</p>
              <p className="text-lg font-bold text-heading">{formatToman(profile.wallet_balance)}</p>
            </div>
          </Card>

          <Card as="form" onSubmit={handleSubmit} className="max-w-md space-y-3">
            <Label tooltip={`حداقل مبلغ برداشت ${MIN_WITHDRAWAL.toLocaleString('fa-IR')} تومانه. مبلغ درخواستی بلافاصله از موجودیت کم می‌شه و اگه ادمین رد کنه، برمی‌گرده.`}>
              مبلغ درخواست برداشت (تومان)
            </Label>
            <NumberInput
              icon={ArrowDownToLine}
              grouped
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(MIN_WITHDRAWAL)}
            />

            {error && (
              <p className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </p>
            )}

            <Button type="submit" loading={submitting} disabled={!canWithdraw} icon={<Send className="size-4" />}>
              {submitting ? 'در حال ثبت...' : 'ثبت درخواست'}
            </Button>
          </Card>

          <div>
            <h3 className="mb-3 text-sm font-medium text-heading">تاریخچه‌ی درخواست‌ها</h3>

            {withdrawals === null && <Spinner label="در حال بارگذاری..." />}

            {withdrawals?.length === 0 && (
              <EmptyState icon={Wallet} title="هنوز درخواستی ثبت نکردی" description="اولین درخواست برداشتت اینجا نشون داده می‌شه." />
            )}

            <div className="grid gap-3">
              {withdrawals?.map((w) => (
                <Card key={w.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-heading">{formatToman(w.amount)}</p>
                    {w.admin_note && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{w.admin_note}</p>}
                  </div>
                  <Badge tone={withdrawalStatusTone[w.status]}>{withdrawalStatusLabel[w.status]}</Badge>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
