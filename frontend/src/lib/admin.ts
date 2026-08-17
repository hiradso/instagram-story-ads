import { api } from './api'
import type { AmbassadorProfile, Campaign, CampaignAssignment, CampaignStatus, PaginatedResponse, User, ViewSubmission } from '../types'

export interface PendingSubmission extends ViewSubmission {
  campaign_assignment: CampaignAssignment & { ambassador: User }
}

export function fetchPendingSubmissions() {
  return api
    .get<PaginatedResponse<PendingSubmission>>('/admin/submissions')
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

export function fetchAdminCampaigns() {
  return api.get<PaginatedResponse<Campaign>>('/admin/campaigns').then((res) => res.data)
}

export function updateCampaignStatus(campaignId: number, status: CampaignStatus) {
  return api.patch<Campaign>(`/admin/campaigns/${campaignId}/status`, { status }).then((res) => res.data)
}

interface AdminAmbassadorProfile extends AmbassadorProfile {
  user: User
}

export function fetchAdminProfiles() {
  return api
    .get<PaginatedResponse<AdminAmbassadorProfile>>('/admin/ambassador-profiles')
    .then((res) => res.data)
}

export function verifyProfile(profileId: number) {
  return api.post(`/admin/ambassador-profiles/${profileId}/verify`)
}

export function updateUserLevel(userId: number, level: number) {
  return api.patch(`/admin/users/${userId}/level`, { level })
}
