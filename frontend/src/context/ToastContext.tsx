import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

type ToastType = 'success' | 'error'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

const AUTO_DISMISS_MS = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId++
      setToasts((current) => [...current, { id, type, message }])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`animate-fade-in-up pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl px-4 py-3 shadow-lg ring-1 ${
              // A floating overlay like this can land over anything behind
              // it (a page's own gradient, the sidebar logo, ...), so its
              // background must be solid/opaque on its own — the subtle
              // low-opacity tint pattern used for inline banners elsewhere
              // in the app only works because those sit inside an
              // already-opaque card/page background, not floating freely.
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-slate-800 dark:text-emerald-300 dark:ring-emerald-500/30'
                : 'bg-red-50 text-red-800 ring-red-200 dark:bg-slate-800 dark:text-red-300 dark:ring-red-500/30'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
              aria-label="بستن"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
