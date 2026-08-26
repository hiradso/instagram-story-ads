import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, KeyRound, Phone, Send } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { extractErrorMessage, extractFieldErrors } from '../lib/errors'
import { toEnglishDigits } from '../lib/labels'
import { evaluatePasswordStrength } from '../lib/passwordStrength'
import { requestPasswordResetOtp, resetPassword } from '../lib/passwordReset'
import { AuthShell } from '../components/AuthShell'
import { Button } from '../components/ui/Button'
import { Label, PasswordInput, PasswordStrengthMeter, TextInput } from '../components/ui/Field'

export function ForgotPassword() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [step, setStep] = useState<'phone' | 'reset'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setSubmitting(true)
    try {
      await requestPasswordResetOtp(phone)
      setStep('reset')
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      showToast('error', extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})

    if (!evaluatePasswordStrength(password).meetsMinimum) {
      setFieldErrors({ password: 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف بزرگ، حرف کوچیک و عدد باشه.' })
      return
    }
    if (password !== passwordConfirmation) {
      setFieldErrors({ password_confirmation: 'تکرار رمز عبور مطابقت نداره.' })
      return
    }

    setSubmitting(true)
    try {
      await resetPassword(phone, code, password, passwordConfirmation)
      showToast('success', 'رمز عبورت با موفقیت تغییر کرد.')
      navigate('/login')
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      showToast('error', extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="بازیابی رمز عبور" subtitle="مدیریت کمپین تبلیغات استوری اینستاگرام">
      {step === 'phone' ? (
        <form onSubmit={handleRequestOtp} noValidate className="space-y-4">
          <div>
            <Label>شماره موبایل</Label>
            <TextInput
              icon={Phone}
              type="tel"
              placeholder="09xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(toEnglishDigits(e.target.value))}
              error={fieldErrors.phone}
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
        <form onSubmit={handleReset} noValidate className="space-y-4">
          <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            اگه این شماره ثبت شده باشه، کد ۶ رقمی براش پیامک شد.
          </p>

          <div>
            <Label>کد تایید</Label>
            <TextInput
              icon={KeyRound}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="------"
              value={code}
              onChange={(e) => setCode(toEnglishDigits(e.target.value).replace(/\D/g, ''))}
              error={fieldErrors.code}
            />
          </div>

          <div>
            <Label>رمز عبور جدید</Label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
            <PasswordStrengthMeter password={password} />
          </div>

          <div>
            <Label>تکرار رمز عبور جدید</Label>
            <PasswordInput
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              error={fieldErrors.password_confirmation}
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
