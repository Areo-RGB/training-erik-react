import { HTMLAttributes } from 'react'

export interface ToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label?: string
  description?: string
  size?: 'sm' | 'md'
}

const sizeClasses = {
  sm: { track: 'w-10 h-6', thumb: 'w-4 h-4 top-1', thumbOn: 'left-5', thumbOff: 'left-1' },
  md: { track: 'w-12 h-7', thumb: 'w-5 h-5 top-1', thumbOn: 'left-6', thumbOff: 'left-1' },
}

export default function Toggle({
  enabled,
  onChange,
  label,
  description,
  size = 'md',
  className = '',
  ...props
}: ToggleProps) {
  const handleClick = () => onChange(!enabled)
  const sizes = sizeClasses[size]

  // Standalone toggle with label inline
  if (!className && !props.onClick) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          className={`relative rounded-full transition-colors ${sizes.track} ${enabled ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'}`}
          aria-pressed={enabled}
        >
          <div
            className={`absolute ${sizes.thumb} bg-white rounded-full shadow-sm transition-transform ${enabled ? sizes.thumbOn : sizes.thumbOff}`}
          />
        </button>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="font-semibold text-[#F1F5F9]">{label}</span>}
            {description && <span className="text-xs text-[#94A3B8]">{description}</span>}
          </div>
        )}
      </div>
    )
  }

  // Card-style toggle with click area
  return (
    <div
      className={`flex items-center justify-between p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors btn-press ${className}`}
      onClick={handleClick}
      {...props}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && <div className="font-semibold text-[#F1F5F9]">{label}</div>}
          {description && <div className="text-xs text-[#94A3B8]">{description}</div>}
        </div>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
        className={`relative rounded-full transition-colors ${sizes.track} ${enabled ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'}`}
        aria-pressed={enabled}
      >
        <div
          className={`absolute ${sizes.thumb} bg-white rounded-full shadow-sm transition-transform ${enabled ? sizes.thumbOn : sizes.thumbOff}`}
        />
      </button>
    </div>
  )
}
