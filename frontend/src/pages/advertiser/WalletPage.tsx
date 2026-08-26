import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, CreditCard, TrendingDown, TrendingUp, Wallet, XCircle } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAdvertiserWallet, requestDeposit } from '../../lib/advertiserWallet'
import { extractErrorMessage } from '../../lib/errors'
import { formatToman } from '../../lib/labels'
import type { AdvertiserWallet } from '../../types'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Label, NumberInput } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { Pagination } from '../../components/ui/Pagination'

const MIN_DEPOSIT = 50000

export function WalletPage() {
  const [wallet, setWallet] = useState<AdvertiserWallet | null>(null)
  const [page, setPage] = useState(1)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  function load() {
    fetchAdvertiserWallet(page).then(setWallet)
  }

  useEffect(load, [page])

  // Capture the callback result once into state, then immediately strip
  // it from the URL — reading straight from searchParams would make the
  // banner disappear the instant the cleanup below runs, since both
  // happen within the same initial render.
  const [banner] = useState(() => ({
    result: searchParams.get('deposit'),
    amount: searchParams.get('amount'),
  }))

  useEffect(() => {
    if (banner.result) setSearchParams({}, { replace: true })
    // Intentionally runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { redirect_url } = await requestDeposit(Number(amount))
      window.location.href = redirect_url
    } catch (err) {
      setError(extractErrorMessage(err))
      setSubmitting(false)
    }
  }

  const canDeposit = Number(amount) >= MIN_DEPOSIT

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-heading">کیف‌پول</h2>
        <p className="mt-0.5 text-sm text-faint">موجودیت رو شارژ کن تا بتونی برای کمپین‌هات بودجه بذاری</p>
      </div>

      {banner.result === 'success' && (
        <p className="animate-fade-in mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          {banner.amount && `${formatToman(banner.amount)} `}با موفقیت به کیف‌پولت اضافه شد.
        </p>
      )}
      {banner.result === 'failed' && (
        <p className="animate-fade-in mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <XCircle className="size-4 shrink-0" />
          پرداخت انجام نشد یا لغو شد.
        </p>
      )}

      {!wallet ? (
        <Spinner label="در حال بارگذاری..." />
      ) : (
        <div className="animate-fade-in-up space-y-4">
          <Card className="flex items-center gap-3 bg-gradient-to-l from-brand-50 to-accent-400/10 dark:from-brand-500/10 dark:to-accent-500/5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-surface text-brand-500 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:text-brand-400 dark:ring-slate-700">
              <Wallet className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-xs text-faint">موجودی کیف‌پول</p>
              <p className="text-lg font-bold text-heading">{formatToman(wallet.wallet_balance)}</p>
            </div>
          </Card>

          <Card as="form" onSubmit={handleSubmit} className="max-w-md space-y-3">
            <Label tooltip={`حداقل مبلغ شارژ ${MIN_DEPOSIT.toLocaleString('fa-IR')} تومانه. بعد از ثبت به درگاه پرداخت زرین‌پال منتقل می‌شی.`}>
              مبلغ شارژ کیف‌پول (تومان)
            </Label>
            <NumberInput
              icon={CreditCard}
              grouped
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(MIN_DEPOSIT)}
            />

            {error && (
              <p className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </p>
            )}

            <Button type="submit" loading={submitting} disabled={!canDeposit} icon={<CreditCard className="size-4" />}>
              {submitting ? 'در حال انتقال به درگاه...' : 'شارژ کیف‌پول'}
            </Button>
          </Card>

          <div>
            <h3 className="mb-3 text-sm font-medium text-heading">تاریخچه‌ی تراکنش‌ها</h3>

            {wallet.transactions.data.length === 0 && (
              <EmptyState icon={Wallet} title="هنوز تراکنشی ثبت نشده" description="اولین شارژ کیف‌پولت اینجا نشون داده می‌شه." />
            )}

            <div className="grid gap-3">
              {wallet.transactions.data.map((tx) => (
                <Card key={tx.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex size-8 items-center justify-center rounded-lg ${
                        tx.type === 'credit'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                      }`}
                    >
                      {tx.type === 'credit' ? (
                        <TrendingUp className="size-4" strokeWidth={1.75} />
                      ) : (
                        <TrendingDown className="size-4" strokeWidth={1.75} />
                      )}
                    </span>
                    <div>
                      <p className="font-medium text-heading">{formatToman(tx.amount)}</p>
                      {tx.description && <p className="text-xs text-faint">{tx.description}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {wallet.transactions.data.length > 0 && (
              <Pagination
                currentPage={wallet.transactions.current_page}
                lastPage={wallet.transactions.last_page}
                total={wallet.transactions.total}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
