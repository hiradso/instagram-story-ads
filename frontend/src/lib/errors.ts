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

/**
 * Laravel's 422 responses put per-field messages under `errors`, keyed by
 * field name (`{ email: ["..."], password: ["..."] }`). This flattens that
 * to a one-message-per-field map so a form can show each error under its
 * own input instead of one generic banner at the top.
 */
export function extractFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof AxiosError)) return {}

  const data = error.response?.data as LaravelErrorResponse | undefined
  if (!data?.errors) return {}

  return Object.fromEntries(
    Object.entries(data.errors)
      .filter(([, messages]) => messages.length > 0)
      .map(([field, messages]) => [field, messages[0]]),
  )
}
