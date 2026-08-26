import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'

// A tab left open across a deploy would otherwise keep running whatever
// JS/CSS it already loaded forever — the new service worker activates in
// the background, but nothing tells an already-running page to pick it
// up. updateSW(true) does: skip-waiting the new worker, then reload once
// it's actually in control, so an update always lands within one of these
// checks instead of silently never reaching an open tab.
const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true)
  },
  onRegisteredSW(_url, registration) {
    if (!registration) return
    setInterval(() => registration.update(), 60 * 60 * 1000)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
