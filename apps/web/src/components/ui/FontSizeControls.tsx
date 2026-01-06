interface FontSizeControlsProps {
  onDecrease: () => void
  onIncrease: () => void
  size?: 'sm' | 'md'
  className?: string
}

export default function FontSizeControls({
  onDecrease,
  onIncrease,
  size = 'md',
  className = '',
}: FontSizeControlsProps) {
  const buttonSize = size === 'sm' ? 'p-2' : 'p-2 sm:p-3'
  
  return (
    <div className={`flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity ${className}`}>
      <button
        onClick={onDecrease}
        className={`${buttonSize} rounded-full bg-[#151A23] text-[#94A3B8] hover:bg-[#2A3441] btn-press touch-manipulation border border-white/10`}
        aria-label="Decrease font size"
      >
        -
      </button>
      <button
        onClick={onIncrease}
        className={`${buttonSize} rounded-full bg-[#151A23] text-[#94A3B8] hover:bg-[#2A3441] btn-press touch-manipulation border border-white/10`}
        aria-label="Increase font size"
      >
        +
      </button>
    </div>
  )
}
