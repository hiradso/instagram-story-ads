import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { HoverLabel } from './Tooltip'

export function ThemeToggle({ position = 'bottom' }: { position?: 'top' | 'bottom' }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <HoverLabel label={isDark ? 'حالت روشن' : 'حالت تاریک'} position={position}>
      <button
        type="button"
        dir="ltr"
        onClick={toggle}
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'رفتن به حالت روشن' : 'رفتن به حالت تاریک'}
        className="relative flex h-8 w-14 shrink-0 items-center rounded-full bg-slate-200 p-1 transition-colors duration-300 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
      >
        <Sun className="absolute left-1.5 size-4 text-amber-500 transition-opacity duration-300" style={{ opacity: isDark ? 0.35 : 1 }} strokeWidth={2} />
        <Moon className="absolute right-1.5 size-4 text-indigo-300 transition-opacity duration-300" style={{ opacity: isDark ? 1 : 0.35 }} strokeWidth={2} />

        <span
          className="absolute left-1 top-1 flex size-6 items-center justify-center rounded-full bg-surface shadow-md transition-transform duration-300 ease-out dark:bg-slate-900"
          style={{ transform: isDark ? 'translateX(1.5rem)' : 'translateX(0)' }}
        >
          {isDark ? (
            <Moon className="size-3.5 text-indigo-300" strokeWidth={2} />
          ) : (
            <Sun className="size-3.5 text-amber-500" strokeWidth={2} />
          )}
        </span>
      </button>
    </HoverLabel>
  )
}
