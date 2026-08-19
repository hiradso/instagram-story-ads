import type { ElementType, ReactNode } from 'react'

interface CardProps {
  as?: ElementType
  children: ReactNode
  hover?: boolean
  className?: string
  [key: string]: unknown
}

export function Card({ as: Component = 'div', children, hover = false, className = '', ...rest }: CardProps) {
  return (
    <Component
      className={`rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-slate-200/70 transition-all duration-200 dark:bg-slate-900 dark:shadow-black/10 dark:ring-slate-800/70 ${
        hover ? 'hover:-translate-y-0.5 hover:shadow-md hover:ring-slate-300 dark:hover:ring-slate-700' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Component>
  )
}
