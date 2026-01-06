interface GameControlButtonsProps {
  onStop?: () => void
  onRestart?: () => void
  onSettings?: () => void
  variant?: 'inline' | 'stacked'
  className?: string
}

export default function GameControlButtons({
  onStop,
  onRestart,
  onSettings,
  variant = 'inline',
  className = '',
}: GameControlButtonsProps) {
  const isStacked = variant === 'stacked'
  const containerClass = isStacked
    ? 'flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none'
    : 'flex items-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none'

  return (
    <div className={`${containerClass} ${className}`}>
      {onSettings && (
        <button
          onClick={onSettings}
          className="flex-1 w-full sm:w-auto bg-[#2A3441] text-[#94A3B8] px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold shadow-sm hover:bg-[#334155] hover:text-white transition-all btn-press touch-manipulation"
        >
          Settings
        </button>
      )}
      {onStop && (
        <button
          onClick={onStop}
          className="flex-1 w-full sm:w-auto bg-[#2A3441] text-[#94A3B8] px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold shadow-sm hover:bg-[#334155] hover:text-white transition-all btn-press touch-manipulation"
        >
          Stop
        </button>
      )}
      {onRestart && (
        <button
          onClick={onRestart}
          className="flex-1 w-full sm:w-auto bg-[#3B82F6] text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold shadow-lg hover:bg-[#2563EB] transition-all btn-press touch-manipulation"
        >
          Restart
        </button>
      )}
    </div>
  )
}
