import { api } from './api'
import type { AssignmentMode, Campaign, Category, PaginatedResponse, Province } from '../types'

export function fetchCampaigns() {
  return api.get<PaginatedResponse<Campaign>>('/advertiser/campaigns').then((res) => res.data)
}

export function fetchCampaign(id: number) {
  return api.get<Campaign>(`/advertiser/campaigns/${id}`).then((res) => res.data)
}

export interface CampaignFormData {
  category_id: number
  title: string
  description: string
  creative: File | null
  price_per_1000_views: string
  budget_total: string
  starts_at: string
  ends_at: string
  province_ids: number[]
  assignment_mode: AssignmentMode
}

function toFormData(data: CampaignFormData) {
  const formData = new FormData()
  formData.append('category_id', String(data.category_id))
  formData.append('title', data.title)
  if (data.description) formData.append('description', data.description)
  if (data.creative) formData.append('creative', data.creative)
  formData.append('price_per_1000_views', data.price_per_1000_views)
  formData.append('budget_total', data.budget_total)
  if (data.starts_at) formData.append('starts_at', data.starts_at)
  if (data.ends_at) formData.append('ends_at', data.ends_at)
  data.province_ids.forEach((id) => formData.append('province_ids[]', String(id)))
  formData.append('assignment_mode', data.assignment_mode)
  return formData
}

export function createCampaign(data: CampaignFormData) {
  return api
    .post<Campaign>('/advertiser/campaigns', toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data)
}

export function updateCampaign(id: number, data: CampaignFormData) {
  return api
    .post<Campaign>(`/advertiser/campaigns/${id}`, toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data)
}

export function deleteCampaign(id: number) {
  return api.delete(`/advertiser/campaigns/${id}`)
}

export function fetchCategories() {
  return api.get<Category[]>('/categories').then((res) => res.data)
}

export function fetchProvinces() {
  return api.get<Province[]>('/provinces').then((res) => res.data)
}

export function fetchCities(provinceId: number) {
  return api.get<{ id: number; name: string }[]>(`/provinces/${provinceId}/cities`).then((res) => res.data)
}
