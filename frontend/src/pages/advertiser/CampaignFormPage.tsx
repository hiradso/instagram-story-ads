import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
      })
      .catch(() => setError('نشد کمپین رو بگیریم.'))
      .finally(() => setLoading(false))
  }, [id])

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
        <p className="text-sm text-slate-500">در حال بارگذاری...</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <h2 className="mb-6 text-lg font-bold text-slate-900">
        {isEdit ? 'ویرایش کمپین' : 'کمپین جدید'}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div>
          <label className="mb-1 block text-sm text-slate-600">عنوان کمپین</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">توضیحات</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">دسته‌بندی</label>
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

        <div>
          <label className="mb-1 block text-sm text-slate-600">
            عکس کریتیو {isEdit && '(اختیاری — فقط اگه می‌خوای عوضش کنی)'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, creative: e.target.files?.[0] ?? null })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">قیمت هر ۱۰۰۰ بازدید (تومان)</label>
            <input
              type="number"
              required
              min={1}
              value={form.price_per_1000_views}
              onChange={(e) => setForm({ ...form, price_per_1000_views: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">بودجه کل (تومان)</label>
            <input
              type="number"
              required
              min={1}
              value={form.budget_total}
              onChange={(e) => setForm({ ...form, budget_total: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">تاریخ شروع</label>
            <input
              type="date"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">تاریخ پایان</label>
            <input
              type="date"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">استان‌های هدف</label>
          <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded-lg border border-slate-200 p-3">
            {provinces.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.province_ids.includes(p.id)}
                  onChange={() => toggleProvince(p.id)}
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'در حال ذخیره...' : isEdit ? 'ذخیره‌ی تغییرات' : 'ساخت کمپین'}
        </button>
      </form>
    </DashboardLayout>
  )
}
