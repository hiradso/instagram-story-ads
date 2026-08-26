import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 1400

/**
 * Counts up from 0 to `value` once, the first time it scrolls into view —
 * used for the landing page's platform-stats strip so real numbers (never
 * hardcoded, see PlatformStatsController) land with a bit of weight instead
 * of just appearing.
 */
export function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return
        hasAnimated.current = true

        const start = performance.now()
        function tick(now: number) {
          const progress = Math.min(1, (now - start) / DURATION_MS)
          // ease-out cubic, so it settles instead of stopping abruptly
          const eased = 1 - (1 - progress) ** 3
          setDisplay(Math.round(eased * value))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref}>{display.toLocaleString('fa-IR')}</span>
}
