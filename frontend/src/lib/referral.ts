import { api } from './api'

export interface ReferralStats {
  referral_code: string | null
  referrals_count: number
  rewarded_referrals_count: number
  total_earned: string
}

export function fetchMyReferralStats() {
  return api.get<ReferralStats>('/me/referrals').then((res) => res.data)
}
