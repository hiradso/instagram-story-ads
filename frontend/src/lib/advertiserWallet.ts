import { api } from './api'
import type { AdvertiserWallet } from '../types'

export function fetchAdvertiserWallet(page = 1) {
  return api
    .get<AdvertiserWallet>('/advertiser/wallet', { params: { page } })
    .then((res) => res.data)
}

export function requestDeposit(amount: number) {
  return api
    .post<{ redirect_url: string }>('/advertiser/wallet/deposit', { amount })
    .then((res) => res.data)
}
