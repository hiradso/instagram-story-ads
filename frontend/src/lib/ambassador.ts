import { api } from './api'
import type { AmbassadorProfile, CampaignAssignment, PaginatedResponse, WithdrawalRequest } from '../types'

export interface ProfileFormData {
  category_id: number
  province_id: number
  city_id: number
  instagram_username: string
  instagram_url: string
  bio: string
  follower_count: number
  avg_views_7d: number
  reach: string
  impressions: string
  engagement_rate: string
  resume: File | null
  advertised_city_ids: number[]
}

function toProfileFormData(data: Partial<ProfileFormData>) {
  const formData = new FormData()
  const { resume, advertised_city_ids, ...rest } = data

  for (const [key, value] of Object.entries(rest)) {
    if (value === null || value === undefined || value === '') continue
    formData.append(key, String(value))
  }
  if (resume) formData.append('resume', resume)
  advertised_city_ids?.forEach((id) => formData.append('advertised_city_ids[]', String(id)))

  return formData
}

export function fetchProfile() {
  return api.get<AmbassadorProfile>('/ambassador/profile').then((res) => res.data)
}

export function createProfile(data: ProfileFormData) {
  return api
    .post<AmbassadorProfile>('/ambassador/profile', toProfileFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data)
}

// POST with a `_method` spoof field, not a real PUT — PHP only parses
// multipart/form-data (the resume file) on a real POST request.
export function updateProfile(data: Partial<ProfileFormData>) {
  const formData = toProfileFormData(data)
  formData.append('_method', 'PUT')

  return api
    .post<AmbassadorProfile>('/ambassador/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data)
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
