import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing'
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

// ─── Lifecycle ────────────────────────────────────────────────────────────────

// Controlled update: page sends SKIP_WAITING after user clicks "Reload"
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('install', (e) => {
  // Precache offline fallback separately — it's not in __WB_MANIFEST
  e.waitUntil(
    caches.open('offline-v1').then((cache) => cache.add('/offline.html'))
  )
  // Do NOT call skipWaiting() here — let the update prompt handle it
})

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})

// ─── App Shell Precache ───────────────────────────────────────────────────────
// __WB_MANIFEST is replaced at build time with [{url, revision}] entries
// Uses cache-first automatically — assets are content-hashed so stale = impossible
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()  // delete stale precache entries from previous SW versions

// ─── SPA Navigation — App Shell Fallback ─────────────────────────────────────
// Every HTML navigation → serve index.html from precache (handles client-side routing)
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/api\//],
  })
)

// ─── Cache-First: Images ──────────────────────────────────────────────────────
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 30 * 24 * 60 * 60,  // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  })
)

// ─── Cache-First: Fonts ───────────────────────────────────────────────────────
// Fonts are immutable — 1-year TTL is safe
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  })
)

// ─── Network-First: API ───────────────────────────────────────────────────────
// Try network → fall to cache after 3s timeout
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-v1',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,  // 5 min; stale API is better than broken
      }),
    ],
  })
)

// ─── Stale-While-Revalidate: JS/CSS Chunks ───────────────────────────────────
// Serve cached chunk instantly, revalidate in background
// Only for un-hashed scripts/styles not covered by precache
registerRoute(
  ({ request, url }) =>
    (request.destination === 'script' || request.destination === 'style') &&
    !url.pathname.includes('/src/'),  // skip Vite HMR endpoints
  new StaleWhileRevalidate({
    cacheName: 'static-resources-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60 }),
    ],
  })
)

// ─── Background Sync: Contact Form ───────────────────────────────────────────
// Queues failed POST requests; replays when connectivity restores
registerRoute(
  ({ url, request }) =>
    url.pathname === '/api/contact' && request.method === 'POST',
  new NetworkFirst({
    cacheName: 'contact-v1',
    plugins: [
      new BackgroundSyncPlugin('contact-queue', {
        maxRetentionTime: 24 * 60,  // retry window: 24 hours (in minutes)
      }),
    ],
  }),
  'POST'
)

// ─── Offline Fallback ─────────────────────────────────────────────────────────
// Navigation fails (no network, no precache hit) → serve offline.html
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    const cached = await caches.match('/offline.html')
    return cached ?? Response.error()
  }
  return Response.error()
})
