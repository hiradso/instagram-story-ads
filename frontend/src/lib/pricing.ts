import { api } from './api'

export interface PricingStats {
  overall: {
    avg: number | null
    min: number | null
    max: number | null
    sample_count: number
  }
  by_category: {
    category_id: number
    category_name: string
    avg: number
    sample_count: number
  }[]
}

export function fetchPricingStats() {
  return api.get<PricingStats>('/pricing').then((res) => res.data)
}
