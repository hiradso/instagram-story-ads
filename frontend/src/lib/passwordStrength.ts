export type PasswordStrengthLevel = 'خیلی‌ضعیف' | 'ضعیف' | 'متوسط' | 'قوی'

export interface PasswordStrength {
  score: number // 0-4
  level: PasswordStrengthLevel
  color: 'red' | 'orange' | 'yellow' | 'emerald'
  // The exact rule set the backend enforces (see AppServiceProvider::boot,
  // Password::min(8)->mixedCase()->numbers()) - a password only "passes"
  // once every one of these is true, kept in sync so the meter never tells
  // someone their password is fine when the server will still reject it.
  meetsMinimum: boolean
}

export interface PasswordRequirement {
  label: string
  met: (password: string) => boolean
}

// The first four mirror the backend's rule set exactly (see
// AppServiceProvider::boot, Password::min(8)->mixedCase()->numbers()) so a
// checked-off list here always means the server will accept it too. The
// symbol requirement is bonus-only — it pushes score from "قوی" further
// but was never required to submit.
export const passwordRequirements: PasswordRequirement[] = [
  { label: 'حداقل ۸ کاراکتر', met: (p) => p.length >= 8 },
  { label: 'حداقل یک حرف بزرگ (A-Z)', met: (p) => /[A-Z]/.test(p) },
  { label: 'حداقل یک حرف کوچک (a-z)', met: (p) => /[a-z]/.test(p) },
  { label: 'حداقل یک عدد', met: (p) => /\d/.test(p) },
  { label: 'یک نماد خاص مثل !@#$ (اختیاری، رمز رو قوی‌تر می‌کنه)', met: (p) => /[^a-zA-Z0-9]/.test(p) },
]

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^a-zA-Z0-9]/.test(password)
  const hasLongLength = password.length >= 12

  const meetsMinimum = hasMinLength && hasLower && hasUpper && hasNumber

  if (password.length === 0) {
    return { score: 0, level: 'خیلی‌ضعیف', color: 'red', meetsMinimum: false }
  }

  if (!meetsMinimum) {
    // Still weak even if it satisfies one or two criteria — length alone
    // (or case variety alone) isn't enough to submit.
    const partialScore = [hasMinLength, hasLower, hasUpper, hasNumber].filter(Boolean).length
    return {
      score: partialScore >= 2 ? 1 : 0,
      level: partialScore >= 2 ? 'ضعیف' : 'خیلی‌ضعیف',
      color: 'red',
      meetsMinimum: false,
    }
  }

  const bonus = [hasSymbol, hasLongLength].filter(Boolean).length

  if (bonus === 0) return { score: 2, level: 'متوسط', color: 'yellow', meetsMinimum: true }
  if (bonus === 1) return { score: 3, level: 'قوی', color: 'emerald', meetsMinimum: true }
  return { score: 4, level: 'قوی', color: 'emerald', meetsMinimum: true }
}
