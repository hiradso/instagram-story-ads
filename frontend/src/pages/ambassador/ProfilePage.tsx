import { useEffect, useState, type FormEvent } from 'react'
import { AxiosError } from 'axios'
import { DashboardLayout } from '../../components/DashboardLayout'
import { createProfile, fetchProfile, updateProfile, type ProfileFormData } from '../../lib/ambassador'
import { fetchCategories, fetchCities, fetchProvinces } from '../../lib/campaigns'
import { extractErrorMessage } from '../../lib/errors'
import { formatToman } from '../../lib/labels'
import type { AmbassadorProfile, Category, Province } from '../../types'

const emptyForm: ProfileFormData = {
  category_id: 0,
  province_id: 0,
  city_id: 0,
  instagram_username: '',
  instagram_url: '',
  follower_count: 0,
  avg_views_7d: 0,
}

export function ProfilePage() {
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<{ id: number; name: string }[]>([])
  const [form, setForm] = useState<ProfileFormData>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProvinces()]).then(([cats, provs]) => {
      setCategories(cats)
      setProvinces(provs)
    })

    fetchProfile()
      .then((p) => setProfile(p))
      .catch((err) => {
        if (err instanceof AxiosError && err.response?.status === 404) {
          setEditing(true)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!form.province_id) {
      setCities([])
      return
    }
    fetchCities(form.province_id).then(setCities)
  }, [form.province_id])

  function startEdit() {
    if (profile) {
      setForm({
        category_id: profile.category_id,
        province_id: profile.province_id,
        city_id: profile.city_id,
        instagram_username: profile.instagram_username,
        instagram_url: profile.instagram_url,
        follower_count: profile.follower_count,
        avg_views_7d: profile.avg_views_7d,
      })
    }
    setEditing(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const saved = profile ? await updateProfile(form) : await createProfile(form)
      setProfile(saved)
      setEditing(false)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-sm text-slate-500">در حال بارگذاری...</p>
      </DashboardLayout>
    )
  }

  if (!editing && profile) {
    return (
      <DashboardLayout>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">پروفایل سفیر</h2>
          <button
            onClick={startEdit}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            ویرایش
          </button>
        </div>

        <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">پیج اینستاگرام</p>
            <a
              href={profile.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-slate-900 hover:underline"
            >
              @{profile.instagram_username}
            </a>
          </div>
          <div>
            <p className="text-xs text-slate-400">وضعیت تایید</p>
            <p className="font-medium text-slate-900">
              {profile.verified_at ? 'تاییدشده' : 'در انتظار تایید ادمین'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">دسته‌بندی</p>
            <p className="font-medium text-slate-900">{profile.category?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">استان / شهر</p>
            <p className="font-medium text-slate-900">
              {profile.province?.name} / {profile.city?.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">تعداد فالوور</p>
            <p className="font-medium text-slate-900">{profile.follower_count.toLocaleString('fa-IR')}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">میانگین بازدید ۷ روزه</p>
            <p className="font-medium text-slate-900">{profile.avg_views_7d.toLocaleString('fa-IR')}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">موجودی کیف‌پول</p>
            <p className="font-medium text-slate-900">{formatToman(profile.wallet_balance)}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <h2 className="mb-6 text-lg font-bold text-slate-900">
        {profile ? 'ویرایش پروفایل سفیر' : 'تکمیل پروفایل سفیر'}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div>
          <label className="mb-1 block text-sm text-slate-600">نام کاربری اینستاگرام</label>
          <input
            required
            value={form.instagram_username}
            onChange={(e) => setForm({ ...form, instagram_username: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">لینک پیج</label>
          <input
            type="url"
            required
            value={form.instagram_url}
            onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
            placeholder="https://instagram.com/..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">دسته‌بندی پیج</label>
          <select
            required
            value={form.category_id || ''}
            onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="" disabled>
              انتخاب کن
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">استان</label>
            <select
              required
              value={form.province_id || ''}
              onChange={(e) => setForm({ ...form, province_id: Number(e.target.value), city_id: 0 })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="" disabled>
                انتخاب کن
              </option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">شهر</label>
            <select
              required
              disabled={!form.province_id}
              value={form.city_id || ''}
              onChange={(e) => setForm({ ...form, city_id: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-50"
            >
              <option value="" disabled>
                انتخاب کن
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">تعداد فالوور</label>
            <input
              type="number"
              required
              min={0}
              value={form.follower_count || ''}
              onChange={(e) => setForm({ ...form, follower_count: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">میانگین بازدید استوری (۷ روز اخیر)</label>
            <input
              type="number"
              required
              min={0}
              value={form.avg_views_7d || ''}
              onChange={(e) => setForm({ ...form, avg_views_7d: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'در حال ذخیره...' : 'ذخیره'}
          </button>
          {profile && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600"
            >
              انصراف
            </button>
          )}
        </div>
      </form>
    </DashboardLayout>
  )
}
