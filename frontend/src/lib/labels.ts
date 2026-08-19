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
import type { AssignmentStatus, CampaignStatus, SubmissionStatus, WithdrawalStatus } from '../types'

type Tone = 'slate' | 'amber' | 'emerald' | 'orange' | 'blue' | 'red'

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
