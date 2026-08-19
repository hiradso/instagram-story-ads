import { api } from './api'
import type { AmbassadorProfile, CampaignAssignment, PaginatedResponse, WithdrawalRequest } from '../types'

export interface ProfileFormData {
  category_id: number
  province_id: number
  city_id: number
  instagram_username: string
  instagram_url: string
  follower_count: number
  avg_views_7d: number
}

export function fetchProfile() {
  return api.get<AmbassadorProfile>('/ambassador/profile').then((res) => res.data)
}

export function createProfile(data: ProfileFormData) {
  return api.post<AmbassadorProfile>('/ambassador/profile', data).then((res) => res.data)
}

export function updateProfile(data: Partial<ProfileFormData>) {
  return api.put<AmbassadorProfile>('/ambassador/profile', data).then((res) => res.data)
}

export function fetchAssignments() {
  return api
    .get<PaginatedResponse<CampaignAssignment>>('/ambassador/assignments')
    .then((res) => res.data)
}

export function submitScreenshot(assignmentId: number, screenshot: File, claimedViews: number) {
  const formData = new FormData()
  formData.append('screenshot', screenshot)
  formData.append('claimed_views', String(claimedViews))

  return api.post(`/ambassador/assignments/${assignmentId}/submission`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function fetchWithdrawals() {
  return api
    .get<PaginatedResponse<WithdrawalRequest>>('/ambassador/withdrawals')
    .then((res) => res.data)
}

export function requestWithdrawal(amount: number) {
  return api.post<WithdrawalRequest>('/ambassador/withdrawals', { amount }).then((res) => res.data)
}
