export type UserRole = 'admin' | 'advertiser' | 'ambassador'

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
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
  assignments?: CampaignAssignmentWithAmbassador[]
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

export interface AmbassadorProfile {
  id: number
  user_id: number
  category_id: number
  province_id: number
  city_id: number
  instagram_username: string
  instagram_url: string
  follower_count: number
  avg_views_7d: number
  wallet_balance: string
  verified_at: string | null
  category?: Category
  province?: Province
  city?: { id: number; name: string }
}

export type AssignmentStatus = 'assigned' | 'posted' | 'submitted' | 'approved' | 'rejected' | 'expired'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface ViewSubmission {
  id: number
  claimed_views: number
  approved_views: number | null
  status: SubmissionStatus
  rejection_reason: string | null
}

export interface CampaignAssignment {
  id: number
  campaign_id: number
  ambassador_id: number
  status: AssignmentStatus
  assigned_at: string
  post_deadline_at: string
  posted_at: string | null
  campaign: Campaign
  view_submission: ViewSubmission | null
}

export interface CampaignAssignmentWithAmbassador {
  id: number
  ambassador_id: number
  status: AssignmentStatus
  assigned_at: string
  post_deadline_at: string
  posted_at: string | null
  ambassador: {
    id: number
    name: string
    ambassador_profile?: { instagram_username: string; instagram_url: string }
  }
  view_submission: ViewSubmission | null
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid'

export interface WithdrawalRequest {
  id: number
  user_id: number
  amount: string
  status: WithdrawalStatus
  processed_by: number | null
  processed_at: string | null
  admin_note: string | null
  created_at: string
  user?: User
}
