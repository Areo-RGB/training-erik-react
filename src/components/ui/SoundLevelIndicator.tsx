export interface SoundLevelIndicatorProps {
  /** Current audio level (0-100) */
  level: number
  /** Threshold value (0-100) to show as red line */
  threshold?: number
  /** Height variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show level as text */
  showValue?: boolean
  /** Additional class names */
  className?: string
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
}

export default function SoundLevelIndicator({
  level,
  threshold,
  size = 'md',
  showValue = false,
  className = '',
}: SoundLevelIndicatorProps) {
  return (
    <div
      className={`relative w-full ${sizeClasses[size]} bg-[#0B0E14] rounded-md overflow-hidden border border-white/5 ${className}`}
    >
      {/* Level bar */}
      <div
        className="absolute inset-y-0 left-0 bg-emerald-500 transition-[width] duration-75 ease-out opacity-80"
        style={{ width: `${level}%` }}
      />

      {/* Threshold marker */}
      {threshold !== undefined && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${threshold}%` }}
        />
      )}

      {/* Value display */}
      {showValue && (
        <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[#F1F5F9] text-xs z-20 mix-blend-difference">
          {Math.round(level)}
        </span>
      )}
    </div>
  )
}
