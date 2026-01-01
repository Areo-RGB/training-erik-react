import { HTMLAttributes } from 'react'

export interface ConfigCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  fullWidth?: boolean
}

export default function ConfigCard({
  children,
  fullWidth = false,
  className = '',
  ...props
}: ConfigCardProps) {
  const widthClass = fullWidth ? 'w-full' : 'w-full max-w-md'

  return (
    <div
      className={`${widthClass} bg-[#151A23] rounded-3xl p-8 shadow-xl border border-white/5 transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Sub-component for organized layout
export function ConfigSection({ className = '', children }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`space-y-6 mb-8 ${className}`}>{children}</div>
}

export function ConfigActions({ className = '', children }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex gap-4 ${className}`}>{children}</div>
}
