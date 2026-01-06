import { HTMLAttributes } from 'react'

type TagVariant = 'default' | 'blue' | 'pink' | 'emerald' | 'orange' | 'purple' | 'cyan'
type TagSize = 'sm' | 'md'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: string
  variant?: TagVariant
  size?: TagSize
}

const variantClasses: Record<TagVariant, string> = {
  default: 'bg-[#0B0E14] text-[#64748B]',
  blue: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
  pink: 'bg-pink-900/20 text-pink-400 border-pink-500/20',
  emerald: 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20',
  orange: 'bg-orange-900/20 text-orange-400 border-orange-500/20',
  purple: 'bg-purple-900/20 text-purple-400 border-purple-500/20',
  cyan: 'bg-cyan-900/20 text-cyan-400 border-cyan-500/20',
}

const sizeClasses: Record<TagSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-1.5 py-0.5 text-[9px]',
}

export default function Tag({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: TagProps) {
  return (
    <span
      className={`inline-block rounded-[4px] font-bold tracking-wider border border-white/5 uppercase ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  )
}
