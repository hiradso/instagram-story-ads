import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ImagePlus, MapPin, Save, Sparkles } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import {
  createCampaign,
  fetchCampaign,
  fetchCategories,
  fetchProvinces,
  updateCampaign,
  type CampaignFormData,
} from '../../lib/campaigns'
import { extractErrorMessage } from '../../lib/errors'
import type { Category, Province } from '../../types'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Label, Select, TextInput, Textarea } from '../../components/ui/Field'
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
}

export function CampaignFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [form, setForm] = useState<CampaignFormData>(emptyForm)
  const [existingCreativePath, setExistingCreativePath] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        })
        setExistingCreativePath(campaign.creative_path)
      })
      .catch(() => setError('نشد کمپین رو بگیریم.'))
      .finally(() => setLoading(false))
  }, [id])

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
    setError(null)

    if (!isEdit && !form.creative) {
      setError('عکس کریتیو کمپین الزامیه.')
      return
    }

    setSubmitting(true)
    try {
      const campaign = isEdit ? await updateCampaign(Number(id), form) : await createCampaign(form)
      navigate(`/advertiser/campaigns/${campaign.id}`)
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

  const displayImage = previewUrl ?? (existingCreativePath ? storageUrl(existingCreativePath) : null)

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tl from-brand-600 to-accent-500 text-white">
          <Sparkles className="size-4" />
        </span>
        <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'ویرایش کمپین' : 'کمپین جدید'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid max-w-2xl gap-5 sm:grid-cols-5">
        {error && (
          <p className="animate-fade-in flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 sm:col-span-5">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}

        <Card className="sm:col-span-2">
          <Label>عکس کریتیو {isEdit && '(اختیاری)'}</Label>
          <label className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-brand-300 hover:bg-brand-50/40">
            {displayImage ? (
              <img src={displayImage} alt="پیش‌نمایش کریتیو" className="size-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
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
        </Card>

        <Card className="space-y-4 sm:col-span-3">
          <div>
            <Label>عنوان کمپین</Label>
            <TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <Label>توضیحات</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label>دسته‌بندی</Label>
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
        </Card>

        <Card className="space-y-4 sm:col-span-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>قیمت هر ۱۰۰۰ بازدید (تومان)</Label>
              <TextInput
                type="number"
                required
                min={1}
                value={form.price_per_1000_views}
                onChange={(e) => setForm({ ...form, price_per_1000_views: e.target.value })}
              />
            </div>
            <div>
              <Label>بودجه کل (تومان)</Label>
              <TextInput
                type="number"
                required
                min={1}
                value={form.budget_total}
                onChange={(e) => setForm({ ...form, budget_total: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>تاریخ شروع</Label>
              <TextInput
                type="date"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </div>
            <div>
              <Label>تاریخ پایان</Label>
              <TextInput
                type="date"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                استان‌های هدف
              </span>
            </Label>
            <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:grid-cols-3">
              {provinces.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm text-slate-600 hover:bg-slate-50"
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
