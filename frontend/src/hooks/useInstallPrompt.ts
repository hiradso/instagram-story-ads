import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function detectIOS() {
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
}

function detectStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari's own (non-standard) flag — matchMedia above doesn't catch it there.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/**
 * Wraps the `beforeinstallprompt` flow (Chrome/Edge on Android & desktop)
 * and iOS detection (Safari never fires that event — "Add to Home Screen"
 * only exists behind its manual Share-sheet flow, so iOS users are pointed
 * to instructions instead of a native prompt).
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(detectStandalone)
  const isIOS = detectIOS()

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferredPrompt) return 'unavailable'

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)

    return outcome
  }

  return {
    // A native one-click prompt is available (Chrome/Edge, Android or desktop).
    canPromptNatively: deferredPrompt !== null,
    // No native prompt exists on iOS — only the manual Share-sheet flow.
    isIOS,
    isStandalone,
    promptInstall,
  }
}
