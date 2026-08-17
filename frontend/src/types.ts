export type UserRole = 'admin' | 'advertiser' | 'ambassador'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  level: number
  status: 'active' | 'suspended'
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Province {
  id: number
  name: string
}

export type CampaignStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'

export interface Campaign {
  id: number
  advertiser_id: number
  category_id: number
  title: string
  description: string | null
  creative_path: string
  price_per_1000_views: string
  budget_total: string
  budget_remaining: string
  capacity_views: number
  views_delivered: number
  status: CampaignStatus
  starts_at: string | null
  ends_at: string | null
  created_at: string
  category?: Category
  provinces?: Province[]
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  total: number
}
