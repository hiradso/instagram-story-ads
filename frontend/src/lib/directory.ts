import { api } from './api'
import type { AmbassadorProfile, PaginatedResponse } from '../types'

export interface DirectoryFilters {
  category_id?: number
  province_id?: number
  search?: string
  page?: number
}

export function fetchAmbassadorDirectory(filters: DirectoryFilters = {}) {
  return api
    .get<PaginatedResponse<AmbassadorProfile>>('/advertiser/ambassadors', { params: filters })
    .then((res) => res.data)
}

export function fetchAmbassadorDirectoryProfile(profileId: number) {
  return api.get<AmbassadorProfile>(`/advertiser/ambassadors/${profileId}`).then((res) => res.data)
}
