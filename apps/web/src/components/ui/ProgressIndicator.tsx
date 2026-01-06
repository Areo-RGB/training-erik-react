interface ProgressIndicatorProps {
  current: number
  total: number
  showBar?: boolean
  className?: string
}

export default function ProgressIndicator({
  current,
  total,
  showBar = false,
  className = '',
}: ProgressIndicatorProps) {
  const percentage = (current / total) * 100

  return (
    <div className={className}>
      {showBar && (
        <div className="w-full h-1 bg-[#2A3441] mb-2">
          <div 
            className="h-1 bg-[#3B82F6] transition-all duration-300" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      <div className="text-2xl sm:text-3xl font-bold text-[#64748B] tabular-nums">
        {current}/{total}
      </div>
    </div>
  )
}
