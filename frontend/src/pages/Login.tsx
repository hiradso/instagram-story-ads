import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, LogIn, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../lib/errors'
import { AuthShell } from '../components/AuthShell'
import { Button } from '../components/ui/Button'
import { Label, TextInput } from '../components/ui/Field'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="ورود به استوری‌یار" subtitle="مدیریت کمپین تبلیغات استوری اینستاگرام">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}

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
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-body">رمز عبور</label>
            <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
              رمزت رو فراموش کردی؟
            </Link>
          </div>
          <TextInput
            icon={Lock}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" loading={submitting} icon={<LogIn className="size-4" />} className="w-full">
          {submitting ? 'در حال ورود...' : 'ورود'}
        </Button>

        <p className="text-center text-sm text-subtle">
          حساب نداری؟{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
            ثبت‌نام کن
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
