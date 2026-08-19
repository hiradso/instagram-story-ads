import { useEffect, useState, type FormEvent } from 'react'
import { AxiosError } from 'axios'
import {
  AlertCircle,
  AtSign,
  BadgeCheck,
  Clock,
  Eye,
  Link2,
  MapPin,
  Pencil,
  Save,
  Tag,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { createProfile, fetchProfile, updateProfile, type ProfileFormData } from '../../lib/ambassador'
import { fetchCategories, fetchCities, fetchProvinces } from '../../lib/campaigns'
import { extractErrorMessage } from '../../lib/errors'
import { formatToman } from '../../lib/labels'
import type { AmbassadorProfile, Category, Province } from '../../types'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Label, Select, TextInput } from '../../components/ui/Field'
import { StatTile } from '../../components/ui/StatTile'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'

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
        <Spinner label="در حال بارگذاری..." />
      </DashboardLayout>
    )
  }

  if (!editing && profile) {
    return (
      <DashboardLayout>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-heading">پروفایل سفیر</h2>
          <Button variant="secondary" size="sm" onClick={startEdit} icon={<Pencil className="size-3.5" />}>
            ویرایش
          </Button>
        </div>

        <div className="animate-fade-in-up space-y-4">
          <Card className="flex items-center justify-between">
            <a
              href={profile.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 font-medium text-heading hover:text-brand-600 dark:hover:text-brand-400"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-orange-400 text-white">
                <Link2 className="size-5" strokeWidth={1.75} />
              </span>
              @{profile.instagram_username}
            </a>
            {profile.verified_at ? (
              <Badge tone="emerald" icon={<BadgeCheck className="size-3.5" />}>
                تاییدشده
              </Badge>
            ) : (
              <Badge tone="amber" icon={<Clock className="size-3.5" />}>
                در انتظار تایید ادمین
              </Badge>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={Tag} label="دسته‌بندی" value={profile.category?.name ?? '—'} />
            <StatTile
              icon={MapPin}
              label="استان / شهر"
              value={`${profile.province?.name ?? '—'} / ${profile.city?.name ?? '—'}`}
            />
            <StatTile icon={Users} label="تعداد فالوور" value={profile.follower_count.toLocaleString('fa-IR')} />
            <StatTile icon={Eye} label="میانگین بازدید ۷ روزه" value={profile.avg_views_7d.toLocaleString('fa-IR')} />
          </div>

          <Card className="flex items-center gap-3 bg-gradient-to-l from-brand-50 to-accent-400/10 dark:from-brand-500/10 dark:to-accent-500/5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-surface text-brand-500 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:text-brand-400 dark:ring-slate-700">
              <Wallet className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-xs text-faint">موجودی کیف‌پول</p>
              <p className="text-lg font-bold text-heading">{formatToman(profile.wallet_balance)}</p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <h2 className="mb-6 text-xl font-bold text-heading">
        {profile ? 'ویرایش پروفایل سفیر' : 'تکمیل پروفایل سفیر'}
      </h2>

      <Card as="form" onSubmit={handleSubmit} className="max-w-xl space-y-4">
        {error && (
          <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}

        <div>
          <Label>نام کاربری اینستاگرام</Label>
          <TextInput
            icon={AtSign}
            required
            value={form.instagram_username}
            onChange={(e) => setForm({ ...form, instagram_username: e.target.value })}
          />
        </div>

        <div>
          <Label>لینک پیج</Label>
          <TextInput
            icon={Link2}
            type="url"
            required
            value={form.instagram_url}
            onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <Label tooltip="کمپین‌ها فقط به سفیرهایی با دسته‌بندی مشابه خودشون تخصیص داده می‌شن، پس این رو با موضوع اصلی محتوای پیجت هماهنگ کن.">
            دسته‌بندی پیج
          </Label>
          <Select
            required
            value={form.category_id || ''}
            onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
          >
            <option value="" disabled>
              انتخاب کن
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>استان</Label>
            <Select
              required
              value={form.province_id || ''}
              onChange={(e) => setForm({ ...form, province_id: Number(e.target.value), city_id: 0 })}
            >
              <option value="" disabled>
                انتخاب کن
              </option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>شهر</Label>
            <Select
              required
              disabled={!form.province_id}
              value={form.city_id || ''}
              onChange={(e) => setForm({ ...form, city_id: Number(e.target.value) })}
            >
              <option value="" disabled>
                انتخاب کن
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>تعداد فالوور</Label>
            <TextInput
              icon={Users}
              type="number"
              required
              min={0}
              value={form.follower_count || ''}
              onChange={(e) => setForm({ ...form, follower_count: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label tooltip="این عدد تعیین می‌کنه چه کمپین‌هایی به تو تخصیص داده می‌شن و پرداختیت چقدره — سعی کن نزدیک به میانگین واقعی آمار استوری‌هات باشه.">
              میانگین بازدید استوری (۷ روز اخیر)
            </Label>
            <TextInput
              icon={Eye}
              type="number"
              required
              min={0}
              value={form.avg_views_7d || ''}
              onChange={(e) => setForm({ ...form, avg_views_7d: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" loading={submitting} icon={<Save className="size-4" />} className="flex-1">
            {submitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
          {profile && (
            <Button type="button" variant="secondary" onClick={() => setEditing(false)} icon={<X className="size-4" />}>
              انصراف
            </Button>
          )}
        </div>
      </Card>
    </DashboardLayout>
  )
}
