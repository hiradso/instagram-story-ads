import type { CSSProperties } from 'react'

/**
 * A small per-item entrance delay for list rows using `animate-fade-in-up`
 * — without it, every row in a list fires the same 0.45s animation at
 * once, which reads as a single flat "flash" rather than a considered
 * reveal. Capped so a long list doesn't take forever to finish animating.
 */
export function staggerStyle(index: number, stepMs = 40, cap = 10): CSSProperties {
  return { animationDelay: `${Math.min(index, cap) * stepMs}ms` }
}
