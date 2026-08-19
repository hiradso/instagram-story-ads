import { api } from './api'

export function requestPasswordResetOtp(phone: string) {
  return api.post<{ message: string }>('/forgot-password', { phone }).then((res) => res.data)
}

export function resetPassword(phone: string, code: string, password: string, passwordConfirmation: string) {
  return api
    .post<{ message: string }>('/reset-password', {
      phone,
      code,
      password,
      password_confirmation: passwordConfirmation,
    })
    .then((res) => res.data)
}
