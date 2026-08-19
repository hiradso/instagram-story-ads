import { api } from './api'
import type { AmbassadorProfile, Campaign, CampaignAssignment, CampaignStatus, PaginatedResponse, User, ViewSubmission, WithdrawalRequest } from '../types'

export interface PendingSubmission extends ViewSubmission {
  campaign_assignment: CampaignAssignment & { ambassador: User }
}

export interface SubmissionFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all'
  page?: number
}

export function fetchSubmissions(filters: SubmissionFilters = {}) {
  return api
    .get<PaginatedResponse<PendingSubmission>>('/admin/submissions', { params: filters })
    .then((res) => res.data)
}

export function fetchSubmissionScreenshot(submissionId: number) {
  return api
    .get(`/admin/submissions/${submissionId}/screenshot`, { responseType: 'blob' })
    .then((res) => URL.createObjectURL(res.data as Blob))
}

export function approveSubmission(submissionId: number, approvedViews?: number) {
  return api.post(`/admin/submissions/${submissionId}/approve`, {
    approved_views: approvedViews ?? null,
  })
}

export function rejectSubmission(submissionId: number, reason: string) {
  return api.post(`/admin/submissions/${submissionId}/reject`, { reason })
}

export interface CampaignFilters {
  status?: CampaignStatus | 'all'
  search?: string
  page?: number
}

export function fetchAdminCampaigns(filters: CampaignFilters = {}) {
  return api
    .get<PaginatedResponse<Campaign>>('/admin/campaigns', { params: filters })
    .then((res) => res.data)
}

export function updateCampaignStatus(campaignId: number, status: CampaignStatus) {
  return api.patch<Campaign>(`/admin/campaigns/${campaignId}/status`, { status }).then((res) => res.data)
}

interface AdminAmbassadorProfile extends AmbassadorProfile {
  user: User
}

export interface ProfileFilters {
  verified?: 'yes' | 'no'
  search?: string
  page?: number
}

export function fetchAdminProfiles(filters: ProfileFilters = {}) {
  return api
    .get<PaginatedResponse<AdminAmbassadorProfile>>('/admin/ambassador-profiles', { params: filters })
    .then((res) => res.data)
}

export function verifyProfile(profileId: number) {
  return api.post(`/admin/ambassador-profiles/${profileId}/verify`)
}

export function updateUserLevel(userId: number, level: number) {
  return api.patch(`/admin/users/${userId}/level`, { level })
}

interface AdminWithdrawalRequest extends WithdrawalRequest {
  user: User
}

export function fetchAdminWithdrawals() {
  return api
    .get<PaginatedResponse<AdminWithdrawalRequest>>('/admin/withdrawals')
    .then((res) => res.data)
}

export function approveWithdrawal(withdrawalId: number, adminNote?: string) {
  return api.post(`/admin/withdrawals/${withdrawalId}/approve`, { admin_note: adminNote ?? null })
}

export function rejectWithdrawal(withdrawalId: number, reason: string) {
  return api.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason })
}

export function markWithdrawalPaid(withdrawalId: number) {
  return api.post(`/admin/withdrawals/${withdrawalId}/mark-paid`)
}
