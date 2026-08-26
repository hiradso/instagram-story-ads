import {
  isValidElement,
  useEffect,
  useRef,
  useState,
  Children,
  type ChangeEvent,
  type InputHTMLAttributes,
  type OptionHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, Check, ChevronDown, Eye, EyeOff, Lock, type LucideIcon } from 'lucide-react'
import { InfoTooltip } from './Tooltip'
import { evaluatePasswordStrength, passwordRequirements } from '../../lib/passwordStrength'
import { toEnglishDigits, toPersianDigits } from '../../lib/labels'

const baseInput =
  'w-full rounded-xl border border-slate-200 bg-surface px-3 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/20 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-600'

export function Label({ children, tooltip }: { children: ReactNode; tooltip?: ReactNode }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-body">
      {children}
      {tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
    </label>
  )
}

const errorInput = 'border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/50 dark:focus:border-red-500 dark:focus:ring-red-500/20'

export function FieldError({ error }: { error?: string }) {
  if (!error) return null

  return (
    <p className="animate-fade-in mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
      <AlertCircle className="size-3.5 shrink-0" />
      {error}
    </p>
  )
}

export function TextInput({
  icon: Icon,
  error,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { icon?: LucideIcon; error?: string }) {
  if (!Icon) {
    return (
      <div className={className}>
        <input className={`${baseInput} ${error ? errorInput : ''}`} aria-invalid={!!error} {...rest} />
        <FieldError error={error} />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint" />
        <input className={`${baseInput} pr-9 ${error ? errorInput : ''}`} aria-invalid={!!error} {...rest} />
      </div>
      <FieldError error={error} />
    </div>
  )
}

/**
 * TextInput with a Lock icon and an eye/eye-off toggle to reveal the
 * typed value — used everywhere a password is entered instead of a bare
 * `type="password"` input, so the user can check what they typed.
 */
export function PasswordInput({
  error,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={className}>
      <div className="relative">
        <Lock className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint" />
        <input
          type={visible ? 'text' : 'password'}
          className={`${baseInput} px-9 ${error ? errorInput : ''}`}
          aria-invalid={!!error}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-faint transition-colors hover:text-slate-600 dark:hover:text-slate-300"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <FieldError error={error} />
    </div>
  )
}

function formatDigitsForDisplay(rawDigits: string, grouped: boolean) {
  if (!rawDigits) return ''
  if (!grouped) return toPersianDigits(rawDigits)
  const num = Number(rawDigits)
  if (Number.isNaN(num)) return ''
  return num.toLocaleString('fa-IR')
}

function digitCountBefore(text: string, position: number) {
  let count = 0
  for (let i = 0; i < position && i < text.length; i++) {
    if (/[0-9۰-۹]/.test(text[i])) count++
  }
  return count
}

function positionForDigitCount(text: string, digitCount: number) {
  if (digitCount <= 0) return 0
  let count = 0
  for (let i = 0; i < text.length; i++) {
    if (/[0-9۰-۹]/.test(text[i])) {
      count++
      if (count === digitCount) return i + 1
    }
  }
  return text.length
}

/**
 * Numeric text input that displays Persian digits as the user types
 * (matching every other number shown on the site) instead of the plain
 * ASCII digits a native `type="number"` input forces. Pass `grouped` for
 * money fields so it also inserts a "٬" every three digits live, the same
 * separator `formatToman`/`toLocaleString('fa-IR')` uses for display
 * elsewhere — this just applies it while typing instead of only after.
 *
 * `value`/`onChange` carry the plain ASCII digit string (e.g. "150000"),
 * same contract as TextInput, so call sites keep doing math/validation on
 * a normal number string — only the rendered text is formatted.
 */
export function NumberInput({
  icon: Icon,
  error,
  className = '',
  value,
  onChange,
  grouped = false,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  icon?: LucideIcon
  error?: string
  value: string | number
  onChange: (e: { target: { value: string } }) => void
  grouped?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingDigitIndexRef = useRef<number | null>(null)
  const rawValue = String(value ?? '')
  const displayValue = formatDigitsForDisplay(rawValue, grouped)

  useEffect(() => {
    if (pendingDigitIndexRef.current === null || !inputRef.current) return
    const pos = positionForDigitCount(displayValue, pendingDigitIndexRef.current)
    inputRef.current.setSelectionRange(pos, pos)
    pendingDigitIndexRef.current = null
  }, [displayValue])

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target
    const cursorPos = input.selectionStart ?? input.value.length
    pendingDigitIndexRef.current = digitCountBefore(input.value, cursorPos)
    const raw = toEnglishDigits(input.value).replace(/[^0-9]/g, '')
    onChange({ target: { value: raw } })
  }

  const input = (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      aria-invalid={!!error}
      className={`${baseInput} ${Icon ? 'pr-9' : ''} ${error ? errorInput : ''}`}
      {...rest}
    />
  )

  if (!Icon) {
    return (
      <div className={className}>
        {input}
        <FieldError error={error} />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint" />
        {input}
      </div>
      <FieldError error={error} />
    </div>
  )
}

const strengthColor: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  emerald: 'bg-emerald-500',
}

const strengthTextColor: Record<string, string> = {
  red: 'text-red-600 dark:text-red-400',
  orange: 'text-orange-600 dark:text-orange-400',
  yellow: 'text-yellow-600 dark:text-yellow-500',
  emerald: 'text-emerald-600 dark:text-emerald-400',
}

/**
 * Live weak/medium/strong feedback for a password field, graded by the
 * exact rules the backend enforces (8+ chars, upper+lower case, a number
 * — see AppServiceProvider::boot), plus a per-requirement checklist that
 * ticks off as the user types so they know exactly what's still missing
 * instead of just seeing "ضعیف" with no explanation. Renders nothing for
 * an empty password so it doesn't nag before the user's typed anything.
 */
export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null

  const { score, level, color } = evaluatePasswordStrength(password)
  const segments = 4

  return (
    <div className="animate-fade-in mt-2">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? strengthColor[color] : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs font-medium ${strengthTextColor[color]}`}>
        قدرت رمز عبور: {level}
      </p>

      <ul className="mt-2 space-y-1">
        {passwordRequirements.map((req) => {
          const met = req.met(password)
          return (
            <li
              key={req.label}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                met ? 'text-emerald-600 dark:text-emerald-400' : 'text-faint'
              }`}
            >
              <span
                className={`flex size-3.5 shrink-0 items-center justify-center rounded-full transition-colors ${
                  met ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                {met && <Check className="size-2.5" strokeWidth={3} />}
              </span>
              {req.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Textarea({
  error,
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <div className={className}>
      <textarea className={`${baseInput} ${error ? errorInput : ''}`} aria-invalid={!!error} {...rest} />
      <FieldError error={error} />
    </div>
  )
}

/**
 * A native <select>'s open dropdown is rendered by the browser/OS, not
 * the page — no amount of CSS gives it rounded corners or a dark-mode
 * palette (same limitation as a native `title=` tooltip). This renders
 * its own popup instead, so it looks like the rest of the UI, while
 * keeping the exact same value/onChange(e.target.value)/children-of-
 * <option> API a real <select> has, so call sites don't need to change.
 */
export function Select({
  value,
  onChange,
  disabled,
  required,
  error,
  className = '',
  children,
}: {
  value: string | number | undefined
  onChange: (e: { target: { value: string } }) => void
  disabled?: boolean
  // Accepted for call-site compatibility with the native <select> API this
  // replaces, but not enforced — there's no browser popup to attach
  // constraint validation to. The backend is the real validation boundary
  // for these fields already.
  required?: boolean
  error?: string
  className?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node
      if (buttonRef.current?.contains(target) || listboxRef.current?.contains(target)) return
      setOpen(false)
    }
    function handleReposition(e: Event) {
      // A scroll inside the listbox itself (the dropdown's own option list)
      // also fires a native 'scroll' event that reaches this window-level
      // capture listener — without this check, scrolling the open dropdown
      // closed it instantly instead of scrolling its options.
      if (e.target instanceof Node && listboxRef.current?.contains(e.target)) return
      setOpen(false)
    }

    document.addEventListener('click', handleOutsideClick)
    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [open])

  function toggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width })
    }
    setOpen((o) => !o)
  }

  const options = Children.toArray(children).flatMap((child) => {
    if (!isValidElement<OptionHTMLAttributes<HTMLOptionElement>>(child)) return []

    return [
      {
        value: String(child.props.value ?? ''),
        label: child.props.children,
        disabled: child.props.disabled,
      },
    ]
  })

  const selected = options.find((option) => option.value === String(value))

  return (
    <div className={className}>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={toggleOpen}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-required={required}
          aria-invalid={!!error}
          className={`${baseInput} flex items-center justify-between gap-2 pl-8 text-right ${error ? errorInput : ''}`}
        >
          <span className="truncate">{selected?.label}</span>
        </button>
        <ChevronDown className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />

        {open &&
          coords &&
          createPortal(
            <div
              ref={listboxRef}
              role="listbox"
              style={{ top: coords.top, left: coords.left, minWidth: coords.width }}
              className="animate-scale-in fixed z-50 max-h-64 w-max max-w-[min(24rem,90vw)] overflow-auto rounded-xl bg-surface p-1 text-sm text-body shadow-lg ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === String(value)}
                  disabled={option.disabled}
                  onClick={() => {
                    onChange({ target: { value: option.value } })
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-right text-heading transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-700"
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === String(value) && <Check className="size-3.5 shrink-0 text-brand-500 dark:text-brand-400" />}
                </button>
              ))}
            </div>,
            document.body,
          )}
      </div>
      <FieldError error={error} />
    </div>
  )
}
