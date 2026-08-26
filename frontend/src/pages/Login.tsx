import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractErrorMessage, extractFieldErrors } from '../lib/errors'
import { roleHome } from '../lib/labels'
import { AuthShell } from '../components/AuthShell'
import { Button } from '../components/ui/Button'
import { Label, PasswordInput, TextInput } from '../components/ui/Field'

export function Login() {
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
    <AuthShell title="ورود به ادیار" subtitle="مدیریت کمپین تبلیغات استوری اینستاگرام">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
            <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
              رمزت رو فراموش کردی؟
            </Link>
          </div>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
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
