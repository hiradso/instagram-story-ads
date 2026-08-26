import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  BadgeCheck,
  FileText,
  Link2,
  MapPin,
  MessageCircle,
  Paperclip,
  Send,
  Tag,
} from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAmbassadorDirectoryProfile } from '../../lib/directory'
import { fetchCampaigns } from '../../lib/campaigns'
import { startConversation } from '../../lib/conversations'
import { extractErrorMessage, extractFieldErrors } from '../../lib/errors'
import { formatNumber } from '../../lib/labels'
import { storageUrl } from '../../lib/storage'
import type { AmbassadorProfile, Campaign } from '../../types'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Label, Select, Textarea } from '../../components/ui/Field'

export function AmbassadorProfileDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null)
  const [manualCampaigns, setManualCampaigns] = useState<Campaign[] | null>(null)
  const [campaignId, setCampaignId] = useState<number | ''>('')
  const [message, setMessage] = useState('')
  const [briefFile, setBriefFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchAmbassadorDirectoryProfile(Number(id))
      .then(setProfile)
      .catch(() => setError('نشد پروفایل رو بگیریم.'))
  }, [id])

  useEffect(() => {
    fetchCampaigns().then((res) => {
      setManualCampaigns(res.data.filter((c) => c.assignment_mode === 'manual'))
    })
  }, [])

  async function handleStartConversation(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    setFieldErrors({})

    if (!campaignId) {
      setFieldErrors({ campaign_id: 'انتخاب کمپین الزامیه.' })
      return
    }
    if (!message.trim()) {
      setFieldErrors({ message: 'نوشتن پیام اولیه الزامیه.' })
      return
    }

    setSubmitting(true)
    try {
      const conversation = await startConversation({
        campaign_id: campaignId,
        ambassador_profile_id: profile.id,
        message,
        brief_file: briefFile,
      })
      navigate(`/conversations/${conversation.id}`)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !profile) {
    return (
      <DashboardLayout>
        <p className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      </DashboardLayout>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <Spinner label="در حال بارگذاری..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="space-y-4 lg:col-span-3">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-base font-bold text-white">
              {profile.instagram_username.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-heading">@{profile.instagram_username}</h2>
                <Badge tone="emerald" icon={<BadgeCheck className="size-3.5" />}>
                  تاییدشده
                </Badge>
              </div>
              <a
                href={profile.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sm text-subtle hover:text-brand-600 dark:hover:text-brand-400"
              >
                <Link2 className="size-3.5" />
                مشاهده‌ی پیج
              </a>
            </div>
          </div>

          {profile.bio && (
            <div>
              <Label>معرفی پیج</Label>
              <p className="text-sm leading-relaxed text-subtle">{profile.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="text-xs text-faint">فالوور</p>
              <p className="font-bold text-heading">{formatNumber(profile.follower_count)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="text-xs text-faint">میانگین بازدید</p>
              <p className="font-bold text-heading">{formatNumber(profile.avg_views_7d)}</p>
            </div>
            {profile.reach !== null && (
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-xs text-faint">Reach</p>
                <p className="font-bold text-heading">{formatNumber(profile.reach)}</p>
              </div>
            )}
            {profile.impressions !== null && (
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-xs text-faint">Impressions</p>
                <p className="font-bold text-heading">{formatNumber(profile.impressions)}</p>
              </div>
            )}
            {profile.engagement_rate !== null && (
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-xs text-faint">تعامل اجتماعی</p>
                <p className="font-bold text-heading">٪{formatNumber(profile.engagement_rate)}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-subtle">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-faint" />
              {profile.province?.name} / {profile.city?.name}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="size-3.5 text-faint" />
              {profile.category?.name}
            </span>
          </div>

          {profile.advertised_cities && profile.advertised_cities.length > 0 && (
            <div>
              <Label>تبلیغات انجام‌شده برای شهرهای</Label>
              <div className="flex flex-wrap gap-1.5">
                {profile.advertised_cities.map((city) => (
                  <Badge key={city.id} tone="blue">
                    {city.name}
                  </Badge>
                ))}
              </div>
            </div>
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
        </Card>

        <Card as="form" onSubmit={handleStartConversation} className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-brand-600 text-white">
              <MessageCircle className="size-4" />
            </span>
            <h3 className="font-bold text-heading">شروع گفت‌وگو</h3>
          </div>

          {manualCampaigns !== null && manualCampaigns.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="کمپین با تخصیص دستی نداری"
              description="اول یه کمپین با روش «خودم سفیر انتخاب کنم» بساز، بعد بیا این‌جا باهاش گفت‌وگو رو شروع کن."
              action={
                <Link to="/advertiser/campaigns/new">
                  <Button size="sm">ساخت کمپین</Button>
                </Link>
              }
            />
          ) : (
            <>
              <div>
                <Label>کمپین</Label>
                <Select
                  value={campaignId}
                  onChange={(e) => setCampaignId(Number(e.target.value))}
                  error={fieldErrors.campaign_id}
                >
                  <option value="" disabled>
                    انتخاب کن
                  </option>
                  {manualCampaigns?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>پیام اولیه</Label>
                <Textarea
                  rows={4}
                  placeholder="خودت و کمپینت رو معرفی کن..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  error={fieldErrors.message}
                />
              </div>

              <div>
                <Label tooltip="فایل توضیحات کامل مدل تبلیغاتی که می‌خوای، با آدرس‌های دقیق برای اعتبارسنجی کسب‌وکارت — اختیاریه.">
                  فایل بریف تبلیغاتی (اختیاری)
                </Label>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-2.5 text-sm text-slate-500 transition-colors hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10">
                  <Paperclip className="size-4 shrink-0" />
                  {briefFile ? briefFile.name : 'انتخاب فایل'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setBriefFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
                {fieldErrors.brief_file && (
                  <p className="animate-fade-in mt-1.5 text-xs text-red-600 dark:text-red-400">{fieldErrors.brief_file}</p>
                )}
              </div>

              {error && (
                <p className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </p>
              )}

              <Button type="submit" loading={submitting} icon={<Send className="size-4" />} className="w-full">
                {submitting ? 'در حال ارسال...' : 'شروع گفت‌وگو'}
              </Button>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
