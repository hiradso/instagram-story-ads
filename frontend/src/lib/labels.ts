import type { CampaignStatus } from '../types'

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  draft: 'پیش‌نویس',
  pending_review: 'در انتظار بررسی',
  active: 'فعال',
  paused: 'متوقف‌شده',
  completed: 'تمام‌شده',
  cancelled: 'لغوشده',
}

export const campaignStatusColor: Record<CampaignStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending_review: 'bg-amber-100 text-amber-700',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-orange-100 text-orange-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function formatToman(value: string | number) {
  return `${Number(value).toLocaleString('fa-IR')} تومان`
}
