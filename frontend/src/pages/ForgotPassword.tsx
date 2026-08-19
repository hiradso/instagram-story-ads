import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, KeyRound, Lock, Phone, Send } from 'lucide-react'
import { extractErrorMessage } from '../lib/errors'
import { requestPasswordResetOtp, resetPassword } from '../lib/passwordReset'
import { AuthShell } from '../components/AuthShell'
import { Button } from '../components/ui/Button'
import { Label, TextInput } from '../components/ui/Field'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'phone' | 'reset'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await requestPasswordResetOtp(phone)
      setStep('reset')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await resetPassword(phone, code, password, passwordConfirmation)
      navigate('/login')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="بازیابی رمز عبور" subtitle="مدیریت کمپین تبلیغات استوری اینستاگرام">
      {step === 'phone' ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          {error && (
            <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          )}

          <div>
            <Label>شماره موبایل</Label>
            <TextInput
              icon={Phone}
              type="tel"
              required
              placeholder="09xxxxxxxxx"
              pattern="^09\d{9}$"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Button type="submit" loading={submitting} icon={<Send className="size-4" />} className="w-full">
            {submitting ? 'در حال ارسال...' : 'ارسال کد بازیابی'}
          </Button>

          <p className="text-center text-sm text-subtle">
            یادت اومد؟{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
              وارد شو
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            اگه این شماره ثبت شده باشه، کد ۶ رقمی براش پیامک شد.
          </p>

          {error && (
            <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          )}

          <div>
            <Label>کد تایید</Label>
            <TextInput
              icon={KeyRound}
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              placeholder="------"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div>
            <Label>رمز عبور جدید</Label>
            <TextInput
              icon={Lock}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Label>تکرار رمز عبور جدید</Label>
            <TextInput
              icon={Lock}
              type="password"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>

          <Button type="submit" loading={submitting} icon={<KeyRound className="size-4" />} className="w-full">
            {submitting ? 'در حال ثبت...' : 'تغییر رمز عبور'}
          </Button>

          <button
            type="button"
            onClick={() => setStep('phone')}
            className="w-full text-center text-sm text-subtle hover:text-brand-600 dark:hover:text-brand-400"
          >
            شماره اشتباهه؟ دوباره امتحان کن
          </button>
        </form>
      )}
    </AuthShell>
  )
}
