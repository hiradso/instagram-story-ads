import { AxiosError } from 'axios'

interface LaravelErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as LaravelErrorResponse | undefined
    const firstFieldError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined
    return firstFieldError ?? data?.message ?? 'خطایی پیش اومد، دوباره امتحان کن.'
  }
  return 'خطایی پیش اومد، دوباره امتحان کن.'
}
