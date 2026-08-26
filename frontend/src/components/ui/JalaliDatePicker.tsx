import { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  gregorianToJalali,
  isoToJalali,
  jalaliMonthLength,
  jalaliMonthNames,
  jalaliToIso,
  jalaliWeekday,
  jalaliWeekdayNames,
  type JalaliDate,
} from '../../lib/jalali'
import { FieldError } from './Field'

const baseTrigger =
  'w-full rounded-xl border border-slate-200 bg-surface px-3 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-500/20 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-600'

const errorTrigger = 'border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/50 dark:focus:border-red-500 dark:focus:ring-red-500/20'

function todayJalali(): JalaliDate {
  const now = new Date()
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

/**
 * A native `type="date"` input always shows the Gregorian calendar (no way
 * to force Jalali via HTML) and its open picker is native browser/OS
 * chrome — same unstylable-popup problem as a native <select> or a native
 * title= tooltip. This is a from-scratch Jalali calendar instead: value
 * in/out is still a Gregorian ISO string (`YYYY-MM-DD`, what the API
 * expects), only the display and picker are Persian.
 */
export function JalaliDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  error,
  className = '',
}: {
  value: string
  onChange: (isoDate: string) => void
  placeholder?: string
  error?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = isoToJalali(value)
  const [viewYear, setViewYear] = useState(() => (selected ?? todayJalali()).year)
  const [viewMonth, setViewMonth] = useState(() => (selected ?? todayJalali()).month)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const base = selected ?? todayJalali()
    setViewYear(base.year)
    setViewMonth(base.month)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    function handleOutsideClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [open])

  function goToPrevMonth() {
    if (viewMonth === 1) {
      setViewMonth(12)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function goToNextMonth() {
    if (viewMonth === 12) {
      setViewMonth(1)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const daysInMonth = jalaliMonthLength(viewYear, viewMonth)
  const firstWeekday = jalaliWeekday(viewYear, viewMonth, 1)
  const leadingBlanks = Array.from({ length: firstWeekday })
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const displayText = selected
    ? `${selected.year.toLocaleString('fa-IR', { useGrouping: false })} ${jalaliMonthNames[selected.month - 1]} ${selected.day.toLocaleString('fa-IR')}`
    : ''

  return (
    <div className={className}>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`${baseTrigger} flex items-center justify-between gap-2 ${error ? errorTrigger : ''}`}
        >
          <span className={displayText ? 'text-heading' : 'text-faint'}>{displayText || placeholder}</span>
          <Calendar className="size-4 shrink-0 text-faint" />
        </button>

        {open && (
          <div className="animate-scale-in absolute z-20 mt-1.5 w-72 rounded-xl bg-surface p-3 shadow-lg ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={goToPrevMonth}
                className="flex size-7 items-center justify-center rounded-lg text-faint transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="ماه قبل"
              >
                <ChevronRight className="size-4" />
              </button>
              <p className="text-sm font-medium text-heading">
                {jalaliMonthNames[viewMonth - 1]} {viewYear.toLocaleString('fa-IR', { useGrouping: false })}
              </p>
              <button
                type="button"
                onClick={goToNextMonth}
                className="flex size-7 items-center justify-center rounded-lg text-faint transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="ماه بعد"
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {jalaliWeekdayNames.map((day) => (
                <span key={day} className="flex h-7 items-center justify-center text-xs font-medium text-faint">
                  {day}
                </span>
              ))}

              {leadingBlanks.map((_, i) => (
                <span key={`blank-${i}`} />
              ))}

              {days.map((day) => {
                const isSelected = selected?.year === viewYear && selected.month === viewMonth && selected.day === day
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      onChange(jalaliToIso(viewYear, viewMonth, day))
                      setOpen(false)
                    }}
                    className={`flex h-8 items-center justify-center rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-brand-600 font-bold text-white'
                        : 'text-body hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {day.toLocaleString('fa-IR')}
                  </button>
                )
              })}
            </div>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
                className="mt-2 w-full rounded-lg py-1.5 text-center text-xs text-subtle transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                پاک کردن تاریخ
              </button>
            )}
          </div>
        )}
      </div>
      <FieldError error={error} />
    </div>
  )
}
