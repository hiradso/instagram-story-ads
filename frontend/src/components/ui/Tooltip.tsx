import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'

/**
 * Small "?" icon that shows an explanatory tooltip on hover/focus.
 * Meant to sit next to a <Label> for a field whose meaning or effect
 * isn't obvious from its name alone.
 */
export function InfoTooltip({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return

    function handleOutsideClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [open])

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-describedby={id}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        className="text-slate-300 transition-colors hover:text-brand-500"
      >
        <HelpCircle className="size-3.5" strokeWidth={2} />
      </button>

      {open && (
        <span
          id={id}
          role="tooltip"
          className="animate-scale-in pointer-events-none absolute bottom-full right-1/2 z-20 mb-2 w-52 translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs leading-relaxed text-white shadow-lg"
        >
          {children}
          <span className="absolute top-full right-1/2 size-2 -translate-y-1/2 translate-x-1/2 rotate-45 bg-slate-800" />
        </span>
      )}
    </span>
  )
}
