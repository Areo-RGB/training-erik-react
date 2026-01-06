interface NumberPadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onClear?: () => void
  submitLabel?: string
}

export default function NumberPad({
  value,
  onChange,
  onSubmit,
  onClear,
  submitLabel = 'Enter',
}: NumberPadProps) {
  const appendDigit = (digit: number) => {
    onChange(value + digit.toString())
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      onChange('')
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm lg:max-w-md">
      {/* Display */}
      <div className="w-full bg-[#151A23] rounded-xl p-4 mb-4 sm:mb-6 text-center min-h-[4rem] flex items-center justify-center shadow-lg border border-white/5">
        <span className="text-3xl sm:text-4xl font-bold tabular-nums text-[#F1F5F9]">
          {value || '?'}
        </span>
      </div>

      {/* Number Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 w-full mb-4 sm:mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit, i) => (
          <button
            key={digit}
            onClick={() => appendDigit(digit)}
            style={{ animationDelay: `${i * 30}ms` }}
            className="animate-enter opacity-0 aspect-square p-3 sm:p-4 lg:p-5 text-xl sm:text-2xl lg:text-3xl font-bold bg-[#1E2532] text-[#F1F5F9] border border-white/5 rounded-xl hover:bg-[#2A3441] hover:-translate-y-0.5 active:translate-y-0 transition-all touch-manipulation"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={() => appendDigit(0)}
          className="animate-enter delay-300 opacity-0 aspect-square p-3 sm:p-4 lg:p-5 text-xl sm:text-2xl lg:text-3xl font-bold bg-[#1E2532] text-[#F1F5F9] border border-white/5 rounded-xl hover:bg-[#2A3441] hover:-translate-y-0.5 active:translate-y-0 transition-all touch-manipulation"
        >
          0
        </button>
        <button
          onClick={handleClear}
          className="animate-enter delay-300 opacity-0 aspect-square p-3 sm:p-4 lg:p-5 text-lg sm:text-xl lg:text-2xl font-bold bg-red-900/20 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all touch-manipulation"
        >
          C
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        className="w-full bg-[#10B981] text-white px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold shadow-lg hover:bg-[#059669] hover:-translate-y-0.5 active:translate-y-0 transition-all animate-enter delay-500 opacity-0 touch-manipulation"
      >
        {submitLabel}
      </button>
    </div>
  )
}
