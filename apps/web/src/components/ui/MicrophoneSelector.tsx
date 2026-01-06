export interface MicrophoneSelectorProps {
  /** List of available audio input devices */
  devices: MediaDeviceInfo[]
  /** Currently selected device ID */
  selectedId: string
  /** Called when user selects a different device */
  onSelect: (deviceId: string) => void
  /** Show loading indicator */
  isLoading?: boolean
  /** Additional class names */
  className?: string
}

export default function MicrophoneSelector({
  devices,
  selectedId,
  onSelect,
  isLoading = false,
  className = '',
}: MicrophoneSelectorProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">
        Mikrofon{' '}
        {isLoading && (
          <span className="text-[#3B82F6] animate-pulse">• Wechselt...</span>
        )}
      </label>
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          disabled={isLoading}
          className={`w-full bg-[#0B0E14] text-[#F1F5F9] text-sm font-medium border border-white/10 rounded-xl px-4 py-3 appearance-none outline-none focus:border-[#3B82F6] transition-colors cursor-pointer hover:bg-[#151A23] ${
            isLoading ? 'opacity-50 cursor-wait' : ''
          }`}
        >
          <option value="default">Standard</option>
          {devices.map((device, i) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Mikrofon ${i + 1}`}
            </option>
          ))}
        </select>

        {/* Dropdown indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]">
          {isLoading ? (
            <svg
              className="animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      </div>

      {devices.length === 0 && (
        <p className="text-xs text-amber-400 mt-2">
          Keine Mikrofone gefunden. Bitte schließe ein Mikrofon an.
        </p>
      )}
    </div>
  )
}
