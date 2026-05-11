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
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm text-sm"
        style={{
          backgroundColor: 'rgba(18,18,20,0.97)',
          border: '1px solid rgba(63,63,70,0.7)',
          color: '#e4e4e7',
        }}
      >
        {offlineReady && !needRefresh ? (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
            <span>App ready for offline use</span>
            <button
              onClick={dismiss}
              className="ml-2 transition-colors"
              style={{ color: '#71717a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e4e4e7'}
              onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
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
              className="transition-colors"
              style={{ color: '#71717a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e4e4e7'}
              onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
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
