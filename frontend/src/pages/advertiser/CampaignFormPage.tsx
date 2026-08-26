import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, MapPin, MessageCircle, Save, Sparkles, Zap } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import {
  createCampaign,
  fetchCampaign,
  fetchCategories,
  fetchProvinces,
  updateCampaign,
  type CampaignFormData,
} from '../../lib/campaigns'
import { useToast } from '../../context/ToastContext'
import { extractErrorMessage, extractFieldErrors } from '../../lib/errors'
import type { Category, Province } from '../../types'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Label, NumberInput, Select, TextInput, Textarea } from '../../components/ui/Field'
import { JalaliDatePicker } from '../../components/ui/JalaliDatePicker'
import { Spinner } from '../../components/ui/Spinner'
import { storageUrl } from '../../lib/storage'

const emptyForm: CampaignFormData = {
  category_id: 0,
  title: '',
  description: '',
  creative: null,
  price_per_1000_views: '',
  budget_total: '',
  starts_at: '',
  ends_at: '',
  province_ids: [],
  assignment_mode: 'auto',
}

export function CampaignFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [form, setForm] = useState<CampaignFormData>(emptyForm)
  const [existingCreativePath, setExistingCreativePath] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProvinces()]).then(([cats, provs]) => {
      setCategories(cats)
      setProvinces(provs)
    })
  }, [])

  useEffect(() => {
    if (!id) return
    fetchCampaign(Number(id))
      .then((campaign) => {
        setForm({
          category_id: campaign.category_id,
          title: campaign.title,
          description: campaign.description ?? '',
          creative: null,
          price_per_1000_views: campaign.price_per_1000_views,
          budget_total: campaign.budget_total,
          starts_at: campaign.starts_at?.slice(0, 10) ?? '',
          ends_at: campaign.ends_at?.slice(0, 10) ?? '',
          province_ids: campaign.provinces?.map((p) => p.id) ?? [],
          assignment_mode: campaign.assignment_mode,
        })
        setExistingCreativePath(campaign.creative_path)
      })
      .catch(() => showToast('error', 'نشد کمپین رو بگیریم.'))
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!form.creative) return
    const url = URL.createObjectURL(form.creative)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [form.creative])

  function toggleProvince(provinceId: number) {
    setForm((f) => ({
      ...f,
      province_ids: f.province_ids.includes(provinceId)
        ? f.province_ids.filter((p) => p !== provinceId)
        : [...f.province_ids, provinceId],
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})

    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = 'عنوان کمپین الزامیه.'
    if (!form.category_id) nextErrors.category_id = 'انتخاب دسته‌بندی الزامیه.'
    if (!form.price_per_1000_views) nextErrors.price_per_1000_views = 'قیمت هر ۱۰۰۰ بازدید الزامیه.'
    if (!form.budget_total) nextErrors.budget_total = 'بودجه کل الزامیه.'
    if (!isEdit && !form.creative) nextErrors.creative = 'عکس کریتیو کمپین الزامیه.'
    if (form.starts_at && form.ends_at && form.ends_at < form.starts_at) {
      nextErrors.ends_at = 'تاریخ پایان باید بعد از تاریخ شروع باشه.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      const campaign = isEdit ? await updateCampaign(Number(id), form) : await createCampaign(form)
      showToast('success', isEdit ? 'تغییرات کمپین ذخیره شد.' : 'کمپین با موفقیت ساخته شد.')
      navigate(`/advertiser/campaigns/${campaign.id}`)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      showToast('error', extractErrorMessage(err))
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

  const displayImage = previewUrl ?? (existingCreativePath ? storageUrl(existingCreativePath) : null)

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tl from-brand-600 to-accent-500 text-white">
          <Sparkles className="size-4" />
        </span>
        <h2 className="text-xl font-bold text-heading">{isEdit ? 'ویرایش کمپین' : 'کمپین جدید'}</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid max-w-2xl gap-5 sm:grid-cols-5">
        <Card className="sm:col-span-2">
          <Label>عکس کریتیو {isEdit && '(اختیاری)'}</Label>
          <label className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10">
            {displayImage ? (
              <img src={displayImage} alt="پیش‌نمایش کریتیو" className="size-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-faint">
                <ImagePlus className="size-8" strokeWidth={1.5} />
                <span className="text-xs">برای آپلود کلیک کن</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, creative: e.target.files?.[0] ?? null })}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
          {fieldErrors.creative && (
            <p className="animate-fade-in mt-1.5 text-xs text-red-600 dark:text-red-400">{fieldErrors.creative}</p>
          )}
        </Card>

        <Card className="space-y-4 sm:col-span-3">
          <div>
            <Label>عنوان کمپین</Label>
            <TextInput
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={fieldErrors.title}
            />
          </div>

          <div>
            <Label>توضیحات</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              error={fieldErrors.description}
            />
          </div>

          <div>
            <Label>دسته‌بندی</Label>
            <Select
              value={form.category_id || ''}
              onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
              error={fieldErrors.category_id}
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
        </Card>

        <Card className="space-y-4 sm:col-span-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label tooltip="این مبلغی‌یه که سفیر به‌ازای هر ۱۰۰۰ بازدید تاییدشده دریافت می‌کنه. هرچی بالاتر باشه، کمپینت جذاب‌تر و اولویت‌دارتر می‌شه.">
                قیمت هر ۱۰۰۰ بازدید (تومان)
              </Label>
              <NumberInput
                grouped
                value={form.price_per_1000_views}
                onChange={(e) => setForm({ ...form, price_per_1000_views: e.target.value })}
                error={fieldErrors.price_per_1000_views}
              />
            </div>
            <div>
              <Label tooltip="کل بودجه‌ای که برای این کمپین کنار می‌ذاری. سقف بازدیدی که می‌تونی بخری از تقسیم همین عدد بر قیمت هر ۱۰۰۰ بازدید محاسبه می‌شه.">
                بودجه کل (تومان)
              </Label>
              <NumberInput
                grouped
                value={form.budget_total}
                onChange={(e) => setForm({ ...form, budget_total: e.target.value })}
                error={fieldErrors.budget_total}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>تاریخ شروع</Label>
              <JalaliDatePicker
                value={form.starts_at}
                onChange={(iso) => setForm({ ...form, starts_at: iso })}
                error={fieldErrors.starts_at}
              />
            </div>
            <div>
              <Label>تاریخ پایان</Label>
              <JalaliDatePicker
                value={form.ends_at}
                onChange={(iso) => setForm({ ...form, ends_at: iso })}
                error={fieldErrors.ends_at}
              />
            </div>
          </div>

          <div>
            <Label tooltip="فقط سفیرهای همین استان‌ها برای این کمپین در نظر گرفته می‌شن. اگه هیچ‌کدوم رو انتخاب نکنی، سفیرهای همه‌ی استان‌ها واجد شرایطن.">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                استان‌های هدف
              </span>
            </Label>
            <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:grid-cols-3">
              {provinces.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={form.province_ids.includes(p.id)}
                    onChange={() => toggleProvince(p.id)}
                    className="size-3.5 rounded accent-brand-500"
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
        </Card>

        <Card className="space-y-3 sm:col-span-5">
          <Label tooltip="با «تخصیص خودکار» سیستم خودش هر ۵ دقیقه سفیرهای مناسب رو پیدا و تخصیص می‌ده. با «انتخاب دستی» خودت از فهرست سفیرهای تاییدشده می‌گردی، باهاشون گفت‌وگو می‌کنی و بعد از توافق شروع همکاری رو می‌زنی.">
            روش تخصیص سفیر
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, assignment_mode: 'auto' })}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                form.assignment_mode === 'auto'
                  ? 'border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <Zap className="size-4" />
              تخصیص خودکار
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, assignment_mode: 'manual' })}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                form.assignment_mode === 'manual'
                  ? 'border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <MessageCircle className="size-4" />
              خودم سفیر انتخاب کنم
            </button>
          </div>
        </Card>

        <Button
          type="submit"
          loading={submitting}
          icon={<Save className="size-4" />}
          className="sm:col-span-5"
        >
          {submitting ? 'در حال ذخیره...' : isEdit ? 'ذخیره‌ی تغییرات' : 'ساخت کمپین'}
        </Button>
      </form>
    </DashboardLayout>
  )
}
