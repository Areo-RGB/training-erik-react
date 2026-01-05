import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PWAUpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
      }
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-enter sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="bg-surface rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 rounded-full bg-primary/20 p-2">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F1F5F9]">
              Neue Version verfügbar
            </p>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Aktualisieren für neue Funktionen
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setNeedRefresh(false)}
            className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-white/5"
          >
            Später
          </button>
          <button
            onClick={() => updateServiceWorker(true)}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Aktualisieren
          </button>
        </div>
      </div>
    </div>
  )
}
