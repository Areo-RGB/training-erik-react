import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
}

const variantClasses: Record<ButtonVariant, { base: string; hover: string }> = {
  primary: {
    base: 'bg-[#3B82F6] text-white shadow-lg',
    hover: 'hover:bg-[#2563EB]',
  },
  secondary: {
    base: 'bg-[#2A3441] text-[#94A3B8] shadow-sm',
    hover: 'hover:bg-[#334155] hover:text-white',
  },
  danger: {
    base: 'bg-red-500 text-white shadow-lg',
    hover: 'hover:bg-red-600',
  },
  success: {
    base: 'bg-[#10B981] text-white shadow-lg',
    hover: 'hover:bg-[#059669]',
  },
  ghost: {
    base: 'bg-transparent text-[#94A3B8]',
    hover: 'hover:text-white hover:bg-[#151A23]',
  },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className = '',
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const classes = [
      'font-bold transition-all btn-press',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses[size],
      variantClasses[variant].base,
      variantClasses[variant].hover,
      fullWidth && 'w-full',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={classes}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
