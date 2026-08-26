import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Smartphone, X } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { Button } from './ui/Button'

const DISMISS_KEY = 'adyar-install-banner-dismissed-until'
const DISMISS_DAYS = 14

function isDismissed() {
  const until = localStorage.getItem(DISMISS_KEY)
  return until !== null && Date.now() < Number(until)
}

function dismissForNow() {
  localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000))
}

export function InstallBanner() {
  const { canPromptNatively, isIOS, isStandalone, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(isDismissed)
  const [visible, setVisible] = useState(false)

  const canShow = !isStandalone && !dismissed && (canPromptNatively || isIOS)

  useEffect(() => {
    if (!canShow) return
    // A small delay so the banner doesn't fight for attention with the
    // page's own entrance animations.
    const timer = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(timer)
  }, [canShow])

  if (!canShow) return null

  function handleDismiss() {
    dismissForNow()
    setDismissed(true)
  }

  async function handleInstallClick() {
    const outcome = await promptInstall()
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setVisible(false)
    }
  }

  return (
    <div
      className={`fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-surface p-4 shadow-lg ring-1 ring-slate-200/70 transition-all duration-500 ease-out dark:bg-slate-900 dark:ring-slate-800 sm:inset-x-auto sm:left-6 ${
        visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-95 opacity-0'
      }`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
        <Smartphone className="size-5" strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-heading">ادیار رو نصب کن</p>
        <p className="mt-0.5 text-xs text-subtle">
          مثل یه اپلیکیشن، از صفحه اصلی گوشی یا کامپیوترت اجراش کن.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {canPromptNatively ? (
          <Button size="sm" icon={<Download className="size-3.5" />} onClick={handleInstallClick}>
            نصب
          </Button>
        ) : (
          <Link to="/install">
            <Button size="sm" onClick={() => setVisible(false)}>
              راهنما
            </Button>
          </Link>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="بستن"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
