import { usePWA } from '../../hooks/usePWA'

export default function UpdatePrompt() {
  const { needRefresh, offlineReady, dismiss, applyUpdate } = usePWA()

  if (!needRefresh && !offlineReady) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-max max-w-[calc(100vw-2rem)]"
    >
      <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/95 px-4 py-3 shadow-xl backdrop-blur-sm text-sm text-zinc-100">
        {offlineReady && !needRefresh ? (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
            <span>App ready for offline use</span>
            <button
              onClick={dismiss}
              className="ml-2 text-zinc-400 hover:text-zinc-100 transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" aria-hidden="true" />
            <span>Update available</span>
            <button
              onClick={applyUpdate}
              className="ml-2 rounded-md bg-amber-500 px-3 py-1 text-xs font-semibold text-black hover:bg-amber-400 transition-colors"
            >
              Reload
            </button>
            <button
              onClick={dismiss}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  )
}
