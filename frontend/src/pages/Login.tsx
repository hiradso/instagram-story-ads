import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, KeyRound, LogIn, Mail, Phone, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractErrorMessage, extractFieldErrors } from '../lib/errors'
import { roleHome, toEnglishDigits } from '../lib/labels'
import { requestLoginOtp } from '../lib/loginOtp'
import { AuthShell } from '../components/AuthShell'
import { Button } from '../components/ui/Button'
import { Label, PasswordInput, TextInput } from '../components/ui/Field'

type Mode = 'password' | 'otp'

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {(
        [
          { value: 'password', label: 'رمز عبور' },
          { value: 'otp', label: 'کد پیامکی' },
        ] as const
      ).map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg py-1.5 text-sm font-medium transition-colors ${
            mode === opt.value
              ? 'bg-surface text-heading shadow-sm dark:bg-slate-700'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function PasswordLoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setSubmitting(true)
    try {
      const user = await login(email, password)
      showToast('success', 'خوش اومدی!')
      navigate(roleHome[user.role])
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      showToast('error', extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="animate-fade-in space-y-4">
      <div>
        <Label>ایمیل</Label>
        <TextInput
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-body">رمز عبور</label>
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            رمزت رو فراموش کردی؟
          </Link>
        </div>
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
      </div>

      <Button type="submit" loading={submitting} icon={<LogIn className="size-4" />} className="w-full">
        {submitting ? 'در حال ورود...' : 'ورود'}
      </Button>
    </form>
  )
}

function OtpLoginForm() {
  const { loginWithOtp } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setSubmitting(true)
    try {
      await requestLoginOtp(phone)
      setStep('code')
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      showToast('error', extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setSubmitting(true)
    try {
      const user = await loginWithOtp(phone, code)
      showToast('success', 'خوش اومدی!')
      navigate(roleHome[user.role])
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      showToast('error', extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'phone') {
    return (
      <form onSubmit={handleRequestOtp} noValidate className="animate-fade-in space-y-4">
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
          {submitting ? 'در حال ارسال...' : 'ارسال کد ورود'}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerify} noValidate className="animate-fade-in space-y-4">
      <p className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
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

      <Button type="submit" loading={submitting} icon={<LogIn className="size-4" />} className="w-full">
        {submitting ? 'در حال ورود...' : 'ورود'}
      </Button>

      <button
        type="button"
        onClick={() => setStep('phone')}
        className="w-full text-center text-sm text-subtle hover:text-brand-600 dark:hover:text-brand-400"
      >
        شماره اشتباهه؟ دوباره امتحان کن
      </button>
    </form>
  )
}

export function Login() {
  const [mode, setMode] = useState<Mode>('password')

  return (
    <AuthShell title="ورود به ادیار" subtitle="مدیریت کمپین تبلیغات استوری اینستاگرام">
      <ModeSwitch mode={mode} onChange={setMode} />

      {mode === 'password' ? <PasswordLoginForm /> : <OtpLoginForm />}

      <p className="mt-4 text-center text-sm text-subtle">
        حساب نداری؟{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
          ثبت‌نام کن
        </Link>
      </p>
    </AuthShell>
  )
}
