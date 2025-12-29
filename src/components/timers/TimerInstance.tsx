import { useState, useEffect, useCallback } from 'react'
import { useAudio } from '../../hooks/useAudio'

interface TimerInstanceProps {
  title?: string
  color?: 'blue' | 'orange'
  defaultDuration?: number
  presets?: number[]
}

export default function TimerInstance({ 
  title = 'Timer', 
  color = 'blue', 
  defaultDuration = 60, 
  presets = [] 
}: TimerInstanceProps) {
  const { playBeep, resumeAudioContext } = useAudio()
  
  const [duration, setDuration] = useState(defaultDuration)
  const [timeLeft, setTimeLeft] = useState(defaultDuration)
  const [isRunning, setIsRunning] = useState(false)

  const theme = color === 'orange'
    ? { bar: 'bg-orange-500', icon: 'text-orange-500', btn: 'bg-orange-600', btnHover: 'hover:bg-orange-500' }
    : { bar: 'bg-[#3B82F6]', icon: 'text-[#3B82F6]', btn: 'bg-[#3B82F6]', btnHover: 'hover:bg-[#2563EB]' }

  const updateDuration = useCallback((val: number) => {
    const newDur = Math.max(1, val)
    setDuration(newDur)
    if (!isRunning) {
      setTimeLeft(newDur)
    }
  }, [isRunning])

  const toggle = async () => {
    if (!isRunning) await resumeAudioContext()
    
    if (isRunning) {
      setIsRunning(false)
    } else {
      setIsRunning(true)
    }
  }

  const reset = () => {
    setIsRunning(false)
    setTimeLeft(duration)
  }

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          playBeep(800, 0.2)
          return duration // Loop
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, duration, playBeep])

  return (
    <div className="relative bg-[#151A23] border border-white/5 rounded-2xl overflow-hidden flex flex-col items-center justify-between min-h-[420px] pb-8 shadow-xl transition-all">
      <div className={`absolute top-0 w-full h-1 opacity-80 ${theme.bar}`}></div>

      <div className="pt-10 text-center">
        <div className={`inline-flex p-4 rounded-full bg-[#0B0E14] mb-4 border border-white/5 ${theme.icon}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#F1F5F9]">{title}</h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-8">
        {presets.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => updateDuration(p)}
                className={`px-3 py-2 text-sm bg-[#0B0E14] text-[#94A3B8] border border-white/5 rounded-lg hover:bg-[#2A3441] hover:text-[#F1F5F9] transition-colors ${duration === p ? `ring-2 font-semibold ${color === 'orange' ? 'ring-orange-500' : 'ring-blue-500'}` : ''}`}
              >
                {p}s
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => updateDuration(duration - 5)}
              className="w-10 h-10 rounded-full bg-[#0B0E14] text-[#94A3B8] hover:bg-[#2A3441] hover:text-white font-bold border border-white/5 transition-colors"
            >
              -
            </button>
            <input
              type="number"
              value={duration}
              onChange={(e) => updateDuration(parseInt(e.target.value) || 0)}
              className="w-20 text-center text-2xl font-bold bg-transparent border-b-2 border-[#2A3441] focus:border-[#3B82F6] outline-none text-[#F1F5F9]"
            />
            <button
              onClick={() => updateDuration(duration + 5)}
              className="w-10 h-10 rounded-full bg-[#0B0E14] text-[#94A3B8] hover:bg-[#2A3441] hover:text-white font-bold border border-white/5 transition-colors"
            >
              +
            </button>
          </div>
        )}

        <div className="text-[4rem] font-bold font-mono tabular-nums text-[#F1F5F9] leading-none my-auto">
          {timeLeft}s
        </div>

        <div className="flex gap-4 w-full mt-auto pt-6">
          <button
            onClick={toggle}
            className={`flex-1 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${isRunning ? 'bg-red-500 hover:bg-red-600' : `${theme.btn} ${theme.btnHover}`}`}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={reset}
            className="w-14 flex items-center justify-center bg-[#0B0E14] border border-white/5 rounded-lg text-[#94A3B8] hover:bg-[#2A3441] hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <polyline points="23 20 23 14 17 14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
