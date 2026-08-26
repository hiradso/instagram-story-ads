import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registered manually in main.tsx instead (see registerSW there) so
      // a new deploy reloads an already-open tab automatically — the
      // auto-injected register script only activates the new service
      // worker in the background, silently, but never refreshes assets
      // already loaded into a tab that was open before the deploy.
      injectRegister: false,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'ادیار (Adyar) — مدیریت کمپین تبلیغات استوری',
        short_name: 'ادیار',
        description: 'پلتفرم مدیریت کمپین‌های تبلیغاتی استوری اینستاگرام',
        lang: 'fa',
        dir: 'rtl',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Never cache API calls with the app-shell strategy — auth state
        // and campaign data must always be fresh, not served stale.
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  server: {
    port: 5175,
  },
})
