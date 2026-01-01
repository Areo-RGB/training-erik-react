import { HTMLAttributes } from 'react'

export interface SliderControlProps extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  boxed?: boolean
  disabled?: boolean
}

const sizeClasses = {
  sm: { label: 'text-xs', value: 'text-sm', bar: 'h-1.5' },
  md: { label: 'text-sm', value: 'text-base', bar: 'h-2' },
  lg: { label: 'text-base', value: 'text-lg', bar: 'h-2.5' },
}

export default function SliderControl({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  showValue = true,
  size = 'md',
  boxed = false,
  className = '',
  disabled = false,
  ...props
}: SliderControlProps) {
  const sizes = sizeClasses[size]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  const content = (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label className={`font-bold text-[#94A3B8] uppercase tracking-wider ${sizes.label}`}>
              {label}
            </label>
          )}
          {showValue && (
            <span className={`font-mono text-[#F1F5F9] font-bold ${sizes.value}`}>
              {value}{unit}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full ${sizes.bar} bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed`}
        {...props}
      />
    </div>
  )

  if (boxed) {
    return (
      <div className="bg-[#0B0E14] border border-white/5 p-4 rounded-xl">
        {content}
      </div>
    )
  }

  return content
}
