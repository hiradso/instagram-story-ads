import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

const FADE_MS = 500

/**
 * Full-page glass overlay shown while a page's initial data is still
 * loading, so nothing below it pops in / shifts layout mid-render — the
 * page renders in full underneath (skeletons and all), this just masks
 * that process behind a frosted-glass blur until `ready`, then fades away
 * to reveal the already-finished page in one smooth reveal instead of
 * several small jumps.
 */
export function PageLoader({ ready }: { ready: boolean }) {
  const [mounted, setMounted] = useState(!ready)

  useEffect(() => {
    if (!ready) {
      setMounted(true)
      return
    }
    const timer = setTimeout(() => setMounted(false), FADE_MS)
    return () => clearTimeout(timer)
  }, [ready])

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
        ready ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 via-white/50 to-accent-400/20 backdrop-blur-2xl dark:from-brand-500/15 dark:via-slate-950/50 dark:to-accent-500/15" />

      <div
        className={`relative transition-transform duration-500 ease-out ${ready ? 'scale-90' : 'scale-100'}`}
      >
        <span className="loader-story size-16">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tl from-brand-600 via-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="size-5" strokeWidth={2} />
          </span>
        </span>
      </div>
    </div>
  )
}
