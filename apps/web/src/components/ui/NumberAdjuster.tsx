interface NumberAdjusterProps {
  label: string
  value: number
  unit?: string
  onDecrease: () => void
  onIncrease: () => void
  min?: number
  max?: number
  step?: number
}

export default function NumberAdjuster({
  label,
  value,
  unit = '',
  onDecrease,
  onIncrease,
  min,
  max,
}: NumberAdjusterProps) {
  const displayValue = unit ? `${value}${unit}` : value

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">{label}</span>
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={onDecrease}
          disabled={min !== undefined && value <= min}
          className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 touch-manipulation disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          -
        </button>
        <span className="text-xl sm:text-2xl font-black w-20 sm:w-24 text-center tabular-nums text-[#F1F5F9]">
          {displayValue}
        </span>
        <button
          onClick={onIncrease}
          disabled={max !== undefined && value >= max}
          className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 touch-manipulation disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          +
        </button>
      </div>
    </div>
  )
}
