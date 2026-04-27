import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',  // use our custom sw.js, not generated
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'prompt',        // show UpdatePrompt instead of silent auto-update
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        globIgnores: ['**/offline.html'],  // don't version-hash the fallback
      },
      manifest: {
        name: 'Sarwar Hossain · Backend Engineer',
        short_name: 'Sarwar',
        description: 'Backend Engineer portfolio — Node.js, TypeScript, NestJS, microservices.',
        theme_color: '#f59e0b',
        background_color: '#09090b',
        display: 'standalone',
        scope: '/',
        start_url: '/?source=pwa',
        orientation: 'portrait-primary',
        categories: ['portfolio'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: {
        enabled: false,   // flip true to debug SW in dev (causes HMR quirks)
        type: 'module',
      },
    }),
  ],
})
