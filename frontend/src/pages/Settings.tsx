import { useState, type FormEvent } from 'react'
import { Lock, Mail, Phone, Save, User as UserIcon } from 'lucide-react'
import { DashboardLayout } from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updatePassword, updatePhone } from '../lib/account'
import { extractErrorMessage, extractFieldErrors } from '../lib/errors'
import { roleLabel, toEnglishDigits } from '../lib/labels'
import { evaluatePasswordStrength } from '../lib/passwordStrength'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Label, PasswordInput, PasswordStrengthMeter, TextInput } from '../components/ui/Field'

function PhoneForm() {
  const { user, setUser } = useAuth()
  const { showToast } = useToast()
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [fieldError, setFieldError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFieldError(undefined)
    setSubmitting(true)
    try {
      const updated = await updatePhone(phone)
      setUser(updated)
      showToast('success', 'شماره موبایلت به‌روز شد.')
    } catch (err) {
      setFieldError(extractFieldErrors(err).phone)
      showToast('error', extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card as="form" onSubmit={handleSubmit} noValidate className="max-w-lg space-y-4">
      <h3 className="flex items-center gap-1.5 font-medium text-heading">
        <Phone className="size-4 text-faint" />
        شماره موبایل
      </h3>

      <div>
        <Label tooltip="این شماره برای پیامک‌های اطلاع‌رسانی (تخصیص کمپین، تایید بازدید، بازیابی رمز عبور) استفاده می‌شه.">
          شماره موبایل
        </Label>
        <TextInput
          icon={Phone}
          type="tel"
          placeholder="09xxxxxxxxx"
          value={phone}
          onChange={(e) => setPhone(toEnglishDigits(e.target.value))}
          error={fieldError}
        />
      </div>

      <Button type="submit" size="sm" loading={submitting} icon={<Save className="size-3.5" />}>
        {submitting ? 'در حال ذخیره...' : 'ذخیره'}
      </Button>
    </Card>
  )
}

function PasswordForm() {
  const { showToast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
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
      await updatePassword(currentPassword, password, passwordConfirmation)
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
      showToast('success', 'رمز عبورت تغییر کرد و از بقیه‌ی دستگاه‌ها خارج شدی.')
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      showToast('error', extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card as="form" onSubmit={handleSubmit} noValidate className="max-w-lg space-y-4">
      <h3 className="flex items-center gap-1.5 font-medium text-heading">
        <Lock className="size-4 text-faint" />
        تغییر رمز عبور
      </h3>

      <div>
        <Label>رمز عبور فعلی</Label>
        <PasswordInput
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={fieldErrors.current_password}
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

      <Button type="submit" size="sm" loading={submitting} icon={<Save className="size-3.5" />}>
        {submitting ? 'در حال ذخیره...' : 'تغییر رمز عبور'}
      </Button>
    </Card>
  )
}

export function Settings() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-heading">تنظیمات حساب</h2>
        <p className="mt-0.5 text-sm text-faint">اطلاعات تماس و رمز عبور حسابت رو مدیریت کن</p>
      </div>

      <div className="animate-fade-in-up space-y-4">
        <Card className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-surface text-brand-500 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:text-brand-400 dark:ring-slate-700">
            <UserIcon className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-medium text-heading">{user?.name}</p>
            <p className="flex items-center gap-1 text-sm text-faint">
              <Mail className="size-3.5" />
              {user?.email}
              {user?.role && ` · ${roleLabel[user.role]}`}
            </p>
          </div>
        </Card>

        <PhoneForm />
        <PasswordForm />
      </div>
    </DashboardLayout>
  )
}
