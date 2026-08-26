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
        className="text-slate-300 transition-colors hover:text-brand-500 dark:text-slate-600 dark:hover:text-brand-400"
      >
        <HelpCircle className="size-3.5" strokeWidth={2} />
      </button>

      {open && (
        <span
          id={id}
          role="tooltip"
          className="animate-scale-in pointer-events-none absolute bottom-full right-1/2 z-20 mb-2 w-52 translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs leading-relaxed text-white shadow-lg dark:bg-slate-700 dark:ring-1 dark:ring-slate-600"
        >
          {children}
          <span className="absolute top-full right-1/2 size-2 -translate-y-1/2 translate-x-1/2 rotate-45 rounded-[2px] bg-slate-800 dark:bg-slate-700" />
        </span>
      )}
    </span>
  )
}

const hoverLabelPosition = {
  top: {
    bubble: 'bottom-full mb-2',
    arrow: 'top-full -translate-y-1/2',
  },
  bottom: {
    bubble: 'top-full mt-2',
    arrow: 'bottom-full translate-y-1/2',
  },
}

/**
 * Styled replacement for a native `title` attribute on an icon-only
 * button/link — the browser's own title tooltip can't be restyled (sharp
 * corners, no dark-mode awareness), so icon buttons should use this
 * instead of `title=` whenever the label needs to look like the rest of
 * the site's UI.
 */
export function HoverLabel({
  label,
  position = 'top',
  align = 'center',
  children,
}: {
  label: string
  position?: 'top' | 'bottom'
  /**
   * 'center' (default) centers the bubble on the trigger — fine as long
   * as there's room on both sides. Use 'end' for a trigger that sits
   * flush against the edge of the screen (e.g. the sidebar's own edge),
   * where a centered bubble would spill off-screen; it anchors the
   * bubble's near edge to the trigger instead, growing away from the
   * screen edge.
   */
  align?: 'center' | 'end'
  children: ReactNode
}) {
  const pos = hoverLabelPosition[position]
  const bubbleAlign = align === 'end' ? 'right-0' : 'right-1/2 translate-x-1/2'
  const arrowAlign = align === 'end' ? 'right-3' : 'right-1/2 translate-x-1/2'

  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${pos.bubble} ${bubbleAlign} z-20 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100 dark:bg-slate-700 dark:ring-1 dark:ring-slate-600`}
      >
        {label}
        <span className={`absolute ${pos.arrow} ${arrowAlign} size-2 rotate-45 rounded-[2px] bg-slate-800 dark:bg-slate-700`} />
      </span>
    </span>
  )
}
