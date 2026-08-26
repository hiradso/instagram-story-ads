import { useEffect, useState, type FormEvent } from 'react'
import { AxiosError } from 'axios'
import {
  AlertCircle,
  AtSign,
  BadgeCheck,
  Clock,
  Eye,
  FileText,
  Link2,
  MapPin,
  Paperclip,
  Pencil,
  Plus,
  Save,
  Tag,
  Target,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { createProfile, fetchProfile, updateProfile, type ProfileFormData } from '../../lib/ambassador'
import { fetchCategories, fetchCities, fetchProvinces } from '../../lib/campaigns'
import { extractErrorMessage } from '../../lib/errors'
import { formatNumber, formatToman } from '../../lib/labels'
import { storageUrl } from '../../lib/storage'
import type { AmbassadorProfile, Category, Province } from '../../types'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Label, NumberInput, Select, Textarea, TextInput } from '../../components/ui/Field'
import { StatTile } from '../../components/ui/StatTile'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'

const emptyForm: ProfileFormData = {
  category_id: 0,
  province_id: 0,
  city_id: 0,
  instagram_username: '',
  instagram_url: '',
  bio: '',
  follower_count: 0,
  avg_views_7d: 0,
  reach: '',
  impressions: '',
  engagement_rate: '',
  resume: null,
  advertised_city_ids: [],
}

interface CityChip {
  id: number
  name: string
}

function AdvertisedCitiesPicker({
  provinces,
  selected,
  onChange,
}: {
  provinces: Province[]
  selected: CityChip[]
  onChange: (cities: CityChip[]) => void
}) {
  const [provinceId, setProvinceId] = useState(0)
  const [cityId, setCityId] = useState(0)
  const [cities, setCities] = useState<CityChip[]>([])

  useEffect(() => {
    if (!provinceId) {
      setCities([])
      return
    }
    fetchCities(provinceId).then(setCities)
  }, [provinceId])

  function addCity() {
    const city = cities.find((c) => c.id === cityId)
    if (!city || selected.some((c) => c.id === city.id)) return
    onChange([...selected, city])
    setCityId(0)
  }

  return (
    <div>
      <Label tooltip="شهرهایی که قبلاً تو اون‌ها تبلیغات اجرا کردی — به آگهی‌دهنده‌ها کمک می‌کنه سابقه‌ی همکاریت رو ببینن.">
        تبلیغات انجام‌شده برای شهرهای
      </Label>
      <div className="flex gap-2">
        <Select value={provinceId || ''} onChange={(e) => setProvinceId(Number(e.target.value))} className="flex-1">
          <option value="" disabled>
            استان
          </option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select
          value={cityId || ''}
          onChange={(e) => setCityId(Number(e.target.value))}
          disabled={!provinceId}
          className="flex-1"
        >
          <option value="" disabled>
            شهر
          </option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Button type="button" variant="secondary" onClick={addCity} disabled={!cityId} icon={<Plus className="size-4" />} />
      </div>
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((city) => (
            <span
              key={city.id}
              className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
            >
              {city.name}
              <button
                type="button"
                onClick={() => onChange(selected.filter((c) => c.id !== city.id))}
                className="text-brand-400 hover:text-brand-700 dark:hover:text-brand-200"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProfilePage() {
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<{ id: number; name: string }[]>([])
  const [form, setForm] = useState<ProfileFormData>(emptyForm)
  const [advertisedCities, setAdvertisedCities] = useState<CityChip[]>([])
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
        bio: profile.bio ?? '',
        follower_count: profile.follower_count,
        avg_views_7d: profile.avg_views_7d,
        reach: profile.reach !== null ? String(profile.reach) : '',
        impressions: profile.impressions !== null ? String(profile.impressions) : '',
        engagement_rate: profile.engagement_rate ?? '',
        resume: null,
        advertised_city_ids: profile.advertised_cities?.map((c) => c.id) ?? [],
      })
      setAdvertisedCities(profile.advertised_cities ?? [])
    }
    setEditing(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = { ...form, advertised_city_ids: advertisedCities.map((c) => c.id) }
      const saved = profile ? await updateProfile(payload) : await createProfile(payload)
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

          {profile.bio && (
            <Card>
              <p className="mb-1.5 text-xs font-medium text-faint">معرفی پیج — به آگهی‌دهنده‌ها نشون داده می‌شه</p>
              <p className="text-sm leading-relaxed text-body">{profile.bio}</p>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={Tag} label="دسته‌بندی" value={profile.category?.name ?? '—'} />
            <StatTile
              icon={MapPin}
              label="استان / شهر"
              value={`${profile.province?.name ?? '—'} / ${profile.city?.name ?? '—'}`}
            />
            <StatTile icon={Users} label="تعداد فالوور" value={profile.follower_count.toLocaleString('fa-IR')} />
            <StatTile icon={Eye} label="میانگین بازدید ۷ روزه" value={profile.avg_views_7d.toLocaleString('fa-IR')} />
            {profile.reach !== null && <StatTile icon={Target} label="Reach" value={profile.reach.toLocaleString('fa-IR')} />}
            {profile.impressions !== null && (
              <StatTile icon={Eye} label="Impressions" value={profile.impressions.toLocaleString('fa-IR')} />
            )}
            {profile.engagement_rate !== null && (
              <StatTile icon={Target} label="درصد تعامل اجتماعی" value={`٪${formatNumber(profile.engagement_rate)}`} />
            )}
          </div>

          {profile.advertised_cities && profile.advertised_cities.length > 0 && (
            <Card>
              <p className="mb-2 text-xs font-medium text-faint">تبلیغات انجام‌شده برای شهرهای</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.advertised_cities.map((city) => (
                  <Badge key={city.id} tone="blue">
                    {city.name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {profile.resume_path && (
            <a
              href={storageUrl(profile.resume_path)}
              target="_blank"
              rel="noreferrer"
              className="flex w-fit items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <FileText className="size-4" />
              دانلود رزومه
            </a>
          )}

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

        <div>
          <Label tooltip="ماهیت پیج و فعالیتت، علاقه‌مندی‌ها و هر چیزی که به آگهی‌دهنده کمک می‌کنه بشناستت — این متن مستقیم به آگهی‌دهنده‌ها نشون داده می‌شه.">
            معرفی پیج
          </Label>
          <Textarea
            rows={4}
            placeholder="پیجم درباره‌ی ... هست و..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
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

        <AdvertisedCitiesPicker provinces={provinces} selected={advertisedCities} onChange={setAdvertisedCities} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>تعداد فالوور</Label>
            <NumberInput
              icon={Users}
              required
              value={form.follower_count || ''}
              onChange={(e) => setForm({ ...form, follower_count: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label tooltip="این عدد تعیین می‌کنه چه کمپین‌هایی به تو تخصیص داده می‌شن و پرداختیت چقدره — سعی کن نزدیک به میانگین واقعی آمار استوری‌هات باشه.">
              میانگین بازدید استوری (۷ روز اخیر)
            </Label>
            <NumberInput
              icon={Eye}
              required
              value={form.avg_views_7d || ''}
              onChange={(e) => setForm({ ...form, avg_views_7d: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label tooltip="تعداد اکانت‌های یکتایی که استوری‌هات رو دیدن — اختیاریه، اگه از اینستاگرام اینسایتس داری وارد کن.">
              Reach (اختیاری)
            </Label>
            <NumberInput
              icon={Target}
              value={form.reach}
              onChange={(e) => setForm({ ...form, reach: e.target.value })}
            />
          </div>
          <div>
            <Label tooltip="کل تعداد نمایش استوری‌هات، شامل بازدیدهای تکراری — اختیاریه.">Impressions (اختیاری)</Label>
            <NumberInput
              icon={Eye}
              value={form.impressions}
              onChange={(e) => setForm({ ...form, impressions: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label tooltip="درصد تعاملی که مخاطب‌هات با محتوات دارن (لایک، کامنت، ری‌پلای و...) — اختیاریه.">
            درصد تعامل اجتماعی (اختیاری)
          </Label>
          <TextInput
            icon={Target}
            type="text"
            inputMode="decimal"
            placeholder="مثلاً ۴.۵"
            value={form.engagement_rate}
            onChange={(e) => setForm({ ...form, engagement_rate: e.target.value })}
          />
        </div>

        <div>
          <Label tooltip="فایلی حاوی سابقه‌ی همکاری‌هات، قیمت پیشنهادی فرمت‌های مختلف تبلیغاتی، و اینکه چه نوع تبلیغی رو ترجیح می‌دی و رو پیجت بهتر جواب می‌ده — اختیاریه.">
            رزومه (اختیاری)
          </Label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-2.5 text-sm text-slate-500 transition-colors hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10">
            <Paperclip className="size-4 shrink-0" />
            {form.resume ? form.resume.name : profile?.resume_path ? 'یه رزومه آپلودشده — برای تغییرش کلیک کن' : 'انتخاب فایل (PDF یا Word)'}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setForm({ ...form, resume: e.target.files?.[0] ?? null })}
              className="hidden"
            />
          </label>
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
