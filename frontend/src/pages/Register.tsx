import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Megaphone, Phone, User, UserPlus, Camera, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractErrorMessage, extractFieldErrors } from '../lib/errors'
import { roleHome, toEnglishDigits } from '../lib/labels'
import { evaluatePasswordStrength } from '../lib/passwordStrength'
import type { UserRole } from '../types'
import { AuthShell } from '../components/AuthShell'
import { Button } from '../components/ui/Button'
import { Label, PasswordInput, PasswordStrengthMeter, TextInput } from '../components/ui/Field'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState<UserRole>(searchParams.get('role') === 'ambassador' ? 'ambassador' : 'advertiser')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})

    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = 'وارد کردن نام الزامیه.'
    if (!email.trim()) nextErrors.email = 'وارد کردن ایمیل الزامیه.'
    if (!evaluatePasswordStrength(password).meetsMinimum) {
      nextErrors.password = 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف بزرگ، حرف کوچیک و عدد باشه.'
    } else if (password !== passwordConfirmation) {
      nextErrors.password_confirmation = 'تکرار رمز عبور مطابقت نداره.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      const user = await register(name, email, phone, password, passwordConfirmation, role)
      showToast('success', 'ثبت‌نامت با موفقیت انجام شد. خوش اومدی!')
      navigate(roleHome[user.role])
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      showToast('error', extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="ثبت‌نام در ادیار" subtitle="مدیریت کمپین تبلیغات استوری اینستاگرام">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <Label>نام</Label>
          <TextInput
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
          />
        </div>

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
          <Label>شماره موبایل (اختیاری)</Label>
          <TextInput
            icon={Phone}
            type="tel"
            placeholder="09xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(toEnglishDigits(e.target.value))}
            error={fieldErrors.phone}
          />
        </div>

        <div>
          <Label>رمز عبور</Label>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
          <PasswordStrengthMeter password={password} />
        </div>

        <div>
          <Label>تکرار رمز عبور</Label>
          <PasswordInput
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            error={fieldErrors.password_confirmation}
          />
        </div>

        <div>
          <Label>نوع حساب</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('advertiser')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                role === 'advertiser'
                  ? 'border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <Megaphone className="size-4" />
              آگهی‌دهنده
            </button>
            <button
              type="button"
              onClick={() => setRole('ambassador')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                role === 'ambassador'
                  ? 'border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <Camera className="size-4" />
              سفیر (صاحب پیج)
            </button>
          </div>
        </div>

        <Button type="submit" loading={submitting} icon={<UserPlus className="size-4" />} className="w-full">
          {submitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
        </Button>

        <p className="text-center text-sm text-subtle">
          قبلاً ثبت‌نام کردی؟{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
            وارد شو
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
