import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Megaphone, Phone, User, UserPlus, Camera, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../lib/errors'
import type { UserRole } from '../types'
import { AuthShell } from '../components/AuthShell'
import { Button } from '../components/ui/Button'
import { Label, TextInput } from '../components/ui/Field'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState<UserRole>('advertiser')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(name, email, phone, password, passwordConfirmation, role)
      navigate('/')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="ثبت‌نام در استوری‌یار" subtitle="مدیریت کمپین تبلیغات استوری اینستاگرام">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}

        <div>
          <Label>نام</Label>
          <TextInput icon={User} required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <Label>ایمیل</Label>
          <TextInput
            icon={Mail}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Label>شماره موبایل (اختیاری)</Label>
          <TextInput
            icon={Phone}
            type="tel"
            placeholder="09xxxxxxxxx"
            pattern="^09\d{9}$"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <Label>رمز عبور</Label>
          <TextInput
            icon={Lock}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <Label>تکرار رمز عبور</Label>
          <TextInput
            icon={Lock}
            type="password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
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
