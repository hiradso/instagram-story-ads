import { useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, KeyRound, Lock, Mail, Phone, Save, User as UserIcon } from 'lucide-react'
import { DashboardLayout } from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { updatePassword, updatePhone } from '../lib/account'
import { extractErrorMessage } from '../lib/errors'
import { roleLabel } from '../lib/labels'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Label, TextInput } from '../components/ui/Field'

function PhoneForm() {
  const { user, setUser } = useAuth()
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)
    try {
      const updated = await updatePhone(phone)
      setUser(updated)
      setSuccess(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card as="form" onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h3 className="flex items-center gap-1.5 font-medium text-heading">
        <Phone className="size-4 text-faint" />
        شماره موبایل
      </h3>

      {error && (
        <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}
      {success && (
        <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          شماره موبایلت به‌روز شد.
        </p>
      )}

      <div>
        <Label tooltip="این شماره برای پیامک‌های اطلاع‌رسانی (تخصیص کمپین، تایید بازدید، بازیابی رمز عبور) استفاده می‌شه.">
          شماره موبایل
        </Label>
        <TextInput
          icon={Phone}
          type="tel"
          placeholder="09xxxxxxxxx"
          pattern="^09\d{9}$"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <Button type="submit" size="sm" loading={submitting} icon={<Save className="size-3.5" />}>
        {submitting ? 'در حال ذخیره...' : 'ذخیره'}
      </Button>
    </Card>
  )
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)
    try {
      await updatePassword(currentPassword, password, passwordConfirmation)
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
      setSuccess(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card as="form" onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h3 className="flex items-center gap-1.5 font-medium text-heading">
        <Lock className="size-4 text-faint" />
        تغییر رمز عبور
      </h3>

      {error && (
        <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}
      {success && (
        <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          رمز عبورت تغییر کرد و از بقیه‌ی دستگاه‌ها خارج شدن.
        </p>
      )}

      <div>
        <Label>رمز عبور فعلی</Label>
        <TextInput
          icon={KeyRound}
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
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
