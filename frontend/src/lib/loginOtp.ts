import { api } from './api'

export function requestLoginOtp(phone: string) {
  return api.post<{ message: string }>('/login/otp/request', { phone }).then((res) => res.data)
}
