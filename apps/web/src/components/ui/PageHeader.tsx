import { HTMLAttributes } from 'react'
import Icon, { IconName } from './Icon'

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon: IconName
  title: string
  description?: string
  iconSize?: 'sm' | 'md' | 'lg'
}

const iconSizes = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-24 h-24',
}

const iconSvgSizes = {
  sm: 24,
  md: 32,
  lg: 40,
}

export default function PageHeader({
  icon,
  title,
  description,
  iconSize = 'md',
  className = '',
  children,
}: PageHeaderProps) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <div className={`flex items-center justify-center mx-auto mb-6 ${iconSizes[iconSize]} bg-[#0B0E14] rounded-full text-[#3B82F6] border border-white/5 shadow-inner`}>
        <Icon name={icon} size={iconSvgSizes[iconSize]} />
      </div>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">{title}</h1>
      {description && <p className="text-[#94A3B8]">{description}</p>}
      {children}
    </div>
  )
}
