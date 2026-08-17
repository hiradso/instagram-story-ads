import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../lib/errors'
import type { UserRole } from '../types'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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
      await register(name, email, password, passwordConfirmation, role)
      navigate('/')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <h1 className="mb-6 text-xl font-bold text-slate-900">ثبت‌نام در استوری‌یار</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <label className="mb-1 block text-sm text-slate-600">نام</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />

        <label className="mb-1 block text-sm text-slate-600">ایمیل</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />

        <label className="mb-1 block text-sm text-slate-600">رمز عبور</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />

        <label className="mb-1 block text-sm text-slate-600">تکرار رمز عبور</label>
        <input
          type="password"
          required
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />

        <label className="mb-1 block text-sm text-slate-600">نوع حساب</label>
        <div className="mb-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole('advertiser')}
            className={`rounded-lg border px-3 py-2 text-sm ${
              role === 'advertiser'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 text-slate-600'
            }`}
          >
            آگهی‌دهنده
          </button>
          <button
            type="button"
            onClick={() => setRole('ambassador')}
            className={`rounded-lg border px-3 py-2 text-sm ${
              role === 'ambassador'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 text-slate-600'
            }`}
          >
            سفیر (صاحب پیج)
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          قبلاً ثبت‌نام کردی؟{' '}
          <Link to="/login" className="font-medium text-slate-900">
            وارد شو
          </Link>
        </p>
      </form>
    </div>
  )
}
