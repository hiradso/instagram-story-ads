import { api } from './api'
import type { User } from '../types'

export function updatePhone(phone: string) {
  return api.patch<User>('/me', { phone }).then((res) => res.data)
}

export function updatePassword(currentPassword: string, password: string, passwordConfirmation: string) {
  return api
    .put<{ message: string }>('/me/password', {
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation,
    })
    .then((res) => res.data)
}
