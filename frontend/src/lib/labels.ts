import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  Clock,
  FileEdit,
  PauseCircle,
  Send,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { AssignmentStatus, CampaignStatus, SubmissionStatus, User, UserRole, WithdrawalStatus } from '../types'

type Tone = 'slate' | 'amber' | 'emerald' | 'orange' | 'blue' | 'red'

export const roleLabel: Record<UserRole, string> = {
  admin: 'ادمین',
  advertiser: 'آگهی‌دهنده',
  ambassador: 'سفیر',
}

export const roleHome: Record<UserRole, string> = {
  admin: '/admin',
  advertiser: '/advertiser/campaigns',
  ambassador: '/ambassador/assignments',
}

export const userStatusLabel: Record<User['status'], string> = {
  active: 'فعال',
  suspended: 'مسدودشده',
}

export const userStatusTone: Record<User['status'], Tone> = {
  active: 'emerald',
  suspended: 'red',
}

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  draft: 'پیش‌نویس',
  pending_review: 'در انتظار بررسی',
  active: 'فعال',
  paused: 'متوقف‌شده',
  completed: 'تمام‌شده',
  cancelled: 'لغوشده',
}

export const campaignStatusTone: Record<CampaignStatus, Tone> = {
  draft: 'slate',
  pending_review: 'amber',
  active: 'emerald',
  paused: 'orange',
  completed: 'blue',
  cancelled: 'red',
}

export const campaignStatusIcon: Record<CampaignStatus, LucideIcon> = {
  draft: FileEdit,
  pending_review: Clock,
  active: CheckCircle2,
  paused: PauseCircle,
  completed: BadgeCheck,
  cancelled: Ban,
}

export function formatNumber(value: string | number) {
  return Number(value).toLocaleString('fa-IR')
}

export function formatToman(value: string | number) {
  return `${formatNumber(value)} تومان`
}

const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
const arabicDigits = '٠١٢٣٤٥٦٧٨٩'

/**
 * Many Iranian keyboard layouts type Persian (or Arabic-indic) digits
 * directly — if that lands in a value we're about to Number()/parseInt(),
 * it silently becomes NaN. Normalize to plain ASCII digits so every text
 * input that accepts numbers keeps working no matter which digits the
 * user's keyboard actually produced.
 */
export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const persianIndex = persianDigits.indexOf(char)
    if (persianIndex !== -1) return String(persianIndex)
    return String(arabicDigits.indexOf(char))
  })
}

export function toPersianDigits(value: string): string {
  return value.replace(/[0-9]/g, (char) => persianDigits[Number(char)])
}

export const assignmentStatusLabel: Record<AssignmentStatus, string> = {
  assigned: 'تخصیص‌داده‌شده',
  posted: 'پست شده',
  submitted: 'در انتظار بررسی',
  approved: 'تاییدشده',
  rejected: 'ردشده',
  expired: 'منقضی‌شده',
}

export const assignmentStatusTone: Record<AssignmentStatus, Tone> = {
  assigned: 'slate',
  posted: 'blue',
  submitted: 'amber',
  approved: 'emerald',
  rejected: 'red',
  expired: 'red',
}

export const assignmentStatusIcon: Record<AssignmentStatus, LucideIcon> = {
  assigned: Send,
  posted: Send,
  submitted: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  expired: Ban,
}

export const submissionStatusLabel: Record<SubmissionStatus, string> = {
  pending: 'در انتظار بررسی ادمین',
  approved: 'تاییدشده',
  rejected: 'ردشده',
}

export const submissionStatusTone: Record<SubmissionStatus, Tone> = {
  pending: 'amber',
  approved: 'emerald',
  rejected: 'red',
}

export const submissionStatusIcon: Record<SubmissionStatus, LucideIcon> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
}

export const withdrawalStatusLabel: Record<WithdrawalStatus, string> = {
  pending: 'در انتظار بررسی',
  approved: 'تاییدشده',
  rejected: 'ردشده',
  paid: 'پرداخت‌شده',
}

export const withdrawalStatusTone: Record<WithdrawalStatus, Tone> = {
  pending: 'amber',
  approved: 'blue',
  rejected: 'red',
  paid: 'emerald',
}

export const withdrawalStatusIcon: Record<WithdrawalStatus, LucideIcon> = {
  pending: Clock,
  approved: BadgeCheck,
  rejected: XCircle,
  paid: CheckCircle2,
}
