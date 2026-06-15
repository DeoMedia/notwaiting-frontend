import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.svg', 'icon-512.svg', 'icon-maskable.svg'],
      manifest: {
        name: '#NotWaiting — Opportunity Africa',
        short_name: '#NotWaiting',
        description: 'A movement for African builders, creators, and innovators.',
        theme_color: '#DD3935',
        background_color: '#F5F5F5',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.svg',     sizes: '192x192',  type: 'image/svg+xml' },
          { src: '/icon-512.svg',     sizes: '512x512',  type: 'image/svg+xml' },
          { src: '/icon-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2}'],
        // Raise the precache size limit to 5 MB to accommodate large hero images.
        // The default is 2 MB — PhoneLandingmobile-02.png exceeds that at 2.86 MB.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Exclude the heaviest hero images from precache — they load fast enough
        // on demand and caching them bloats the service worker install payload.
        globIgnores: [
          '**/PhoneLandingmobile-02*',
          '**/PhoneLandingmobile-03*',
          '**/Landing1*',
          '**/Landing3*',
        ],
        // Do not runtime-cache backend API responses. Auth cookies and
        // per-user data must never be served stale on shared devices.
        runtimeCaching: [],
      },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})