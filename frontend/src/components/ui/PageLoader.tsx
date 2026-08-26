import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

const FADE_MS = 500
// Never shows for less than this, even on a fast connection — a loader
// that flashes for a few ms reads as a glitch, not a deliberate reveal.
const MIN_VISIBLE_MS = 700

/**
 * Full-page glass overlay shown while a page's initial data — and the
 * page's own resources (images, fonts, etc., via `window.load`) — are
 * still loading, so nothing below it pops in / shifts layout mid-render.
 * The page renders in full underneath (skeletons and all); this just
 * masks that process behind a frosted-glass blur until everything is
 * genuinely ready, then fades away to reveal the finished page in one
 * smooth reveal instead of several small jumps.
 *
 * "Ready" requires all three, regardless of connection speed:
 *  - the caller's own `ready` prop (its data fetches resolved)
 *  - the browser's `load` event (images/fonts/scripts finished)
 *  - a minimum visible duration, so it never just flashes
 */
export function PageLoader({ ready }: { ready: boolean }) {
  const [windowLoaded, setWindowLoaded] = useState(() => document.readyState === 'complete')
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    if (windowLoaded) return
    const onLoad = () => setWindowLoaded(true)
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [windowLoaded])

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [])

  const done = ready && windowLoaded && minTimeElapsed

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(() => setMounted(false), FADE_MS)
    return () => clearTimeout(timer)
  }, [done])

  useEffect(() => {
    if (!mounted) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ease-out ${
        done ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 via-white/50 to-accent-400/20 backdrop-blur-2xl dark:from-brand-500/15 dark:via-slate-950/50 dark:to-accent-500/15" />

      <div className={`relative transition-transform duration-500 ease-out ${done ? 'scale-90' : 'scale-100'}`}>
        <span className="loader-story size-16">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="size-5" strokeWidth={2} />
          </span>
        </span>
      </div>
    </div>
  )
}
