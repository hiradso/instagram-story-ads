import { api } from './api'

export interface PlatformStats {
  campaigns_run: number
  views_delivered: number
  verified_ambassadors: number
  advertisers: number
}

export function fetchPlatformStats() {
  return api.get<PlatformStats>('/platform-stats').then((res) => res.data)
}
