import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Mail, Megaphone, Phone, User, UserPlus } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { createUser } from '../../lib/admin'
import { useToast } from '../../context/ToastContext'
import { extractErrorMessage, extractFieldErrors } from '../../lib/errors'
import { toEnglishDigits } from '../../lib/labels'
import { evaluatePasswordStrength } from '../../lib/passwordStrength'
import type { UserRole } from '../../types'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Label, PasswordInput, PasswordStrengthMeter, TextInput } from '../../components/ui/Field'

export function UserFormPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState<Extract<UserRole, 'advertiser' | 'ambassador'>>('advertiser')
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
      await createUser({ name, email, phone, password, password_confirmation: passwordConfirmation, role })
      showToast('success', 'کاربر با موفقیت ساخته شد.')
      navigate('/admin/users')
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      showToast('error', extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tl from-brand-600 to-accent-500 text-white">
          <UserPlus className="size-4" />
        </span>
        <h2 className="text-xl font-bold text-heading">افزودن کاربر</h2>
      </div>

      <Card as="form" onSubmit={handleSubmit} noValidate className="max-w-md space-y-4">
        <div>
          <Label>نام</Label>
          <TextInput icon={User} value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} />
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

        <div className="flex gap-2">
          <Button type="submit" loading={submitting} icon={<UserPlus className="size-4" />}>
            {submitting ? 'در حال ساخت...' : 'ساخت کاربر'}
          </Button>
          <Link to="/admin/users">
            <Button type="button" variant="secondary">
              انصراف
            </Button>
          </Link>
        </div>
      </Card>
    </DashboardLayout>
  )
}
