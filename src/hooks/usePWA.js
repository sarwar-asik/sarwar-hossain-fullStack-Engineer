import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePWA() {
  const {
    needRefresh:   [needRefresh,  setNeedRefresh],
    offlineReady:  [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (!registration) return
      // Poll for SW updates every hour (background tab support)
      setInterval(() => registration.update(), 60 * 60 * 1000)
    },
    onRegisterError(err) {
      console.error('[SW] registration failed:', err)
    },
  })

  function dismiss() {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  function applyUpdate() {
    // Sends SKIP_WAITING to the waiting SW, then reloads
    updateServiceWorker(true)
  }

  return { needRefresh, offlineReady, dismiss, applyUpdate }
}
