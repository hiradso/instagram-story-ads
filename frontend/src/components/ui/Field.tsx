import {
  isValidElement,
  useEffect,
  useRef,
  useState,
  Children,
  type InputHTMLAttributes,
  type OptionHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { InfoTooltip } from './Tooltip'

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

export function TextInput({
  icon: Icon,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { icon?: LucideIcon }) {
  if (!Icon) return <input className={`${baseInput} ${className}`} {...rest} />

  return (
    <div className={`relative ${className}`}>
      <Icon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint" />
      <input className={`${baseInput} pr-9`} {...rest} />
    </div>
  )
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseInput} ${className}`} {...rest} />
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
  className?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleOutsideClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [open])

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
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
        className={`${baseInput} flex items-center justify-between gap-2 pl-8 text-right`}
      >
        <span className="truncate">{selected?.label}</span>
      </button>
      <ChevronDown className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />

      {open && (
        <div
          role="listbox"
          className="animate-scale-in absolute z-20 mt-1.5 max-h-64 w-full min-w-max overflow-auto rounded-xl bg-surface p-1 text-sm text-body shadow-lg ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700"
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
        </div>
      )}
    </div>
  )
}
