import { InputHTMLAttributes } from 'react'

export interface NumberStepperProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'inputMode' | 'size'> {
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  label?: string
  showButtons?: boolean
  layout?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: { button: 'w-8 h-8 text-sm', input: 'text-lg w-14', gap: 'gap-3' },
  md: { button: 'w-10 h-10 text-xl', input: 'text-2xl w-16', gap: 'gap-4' },
  lg: { button: 'w-12 h-12 text-2xl', input: 'text-3xl w-20', gap: 'gap-6' },
}

export default function NumberStepper({
  value,
  onChange,
  step = 1,
  min,
  max,
  label,
  showButtons = true,
  layout = 'horizontal',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}: NumberStepperProps) {
  const sizes = sizeClasses[size]

  const decrement = () => {
    const newValue = value - step
    if (min !== undefined) onChange(Math.max(min, newValue))
    else onChange(newValue)
  }

  const increment = () => {
    const newValue = value + step
    if (max !== undefined) onChange(Math.min(max, newValue))
    else onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10)
    if (!isNaN(newValue)) {
      if (min !== undefined && newValue < min) onChange(min)
      else if (max !== undefined && newValue > max) onChange(max)
      else onChange(newValue)
    }
  }

  const buttonClass = `${sizes.button} rounded-full bg-[#0B0E14] text-[#94A3B8] hover:bg-[#2A3441] hover:text-white font-bold border border-white/5 transition-colors btn-press disabled:opacity-50 disabled:cursor-not-allowed`

  const inputClass = `${sizes.input} text-center font-bold bg-transparent border-b-2 border-[#2A3441] focus:border-[#3B82F6] outline-none text-[#F1F5F9]`

  const isMinReached = min !== undefined && value <= min
  const isMaxReached = max !== undefined && value >= max

  const content = (
    <div className={`flex items-center ${layout === 'vertical' ? 'flex-col' : ''} ${sizes.gap} ${className}`}>
      {showButtons && (
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || isMinReached}
          className={buttonClass}
          aria-label="Decrease"
        >
          -
        </button>
      )}

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className={inputClass}
        {...props}
      />

      {showButtons && (
        <button
          type="button"
          onClick={increment}
          disabled={disabled || isMaxReached}
          className={buttonClass}
          aria-label="Increase"
        >
          +
        </button>
      )}
    </div>
  )

  if (label) {
    return (
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">{label}</span>
        {content}
      </div>
    )
  }

  return content
}
