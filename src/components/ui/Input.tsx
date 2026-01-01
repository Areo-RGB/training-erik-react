import { InputHTMLAttributes, forwardRef, useState } from 'react'

type InputVariant = 'default' | 'underline' | 'filled'
type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  variant?: InputVariant
  inputSize?: InputSize
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-3 text-base rounded-xl',
  lg: 'px-5 py-4 text-lg rounded-xl',
}

const variantClasses: Record<InputVariant, string> = {
  default: 'bg-[#0B0E14] border border-white/10 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]',
  underline: 'bg-transparent border-b-2 border-[#2A3441] focus:border-[#3B82F6] rounded-none px-0',
  filled: 'bg-[#2A3441] border border-transparent focus:bg-[#151A23] focus:border-[#3B82F6]',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      variant = 'default',
      inputSize = 'md',
      leftElement,
      rightElement,
      className = '',
      disabled = false,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [inputId] = useState(id || `input-${Math.random().toString(36).substr(2, 9)}`)

    const baseClasses = [
      'w-full outline-none text-[#F1F5F9] placeholder:text-gray-600 transition-all',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses[inputSize],
      variantClasses[variant],
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      leftElement && 'pl-10',
      rightElement && 'pr-10',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-[#94A3B8] mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={baseClasses}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
