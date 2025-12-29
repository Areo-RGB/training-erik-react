import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocalStorageNumber } from '../hooks/useLocalStorage'

export default function SoundCounter() {
  const [threshold, setThreshold] = useLocalStorageNumber('sound_counter_threshold', 50)
  const [cooldown, setCooldown] = useLocalStorageNumber('sound_counter_cooldown', 500)
  
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'config' | 'active'>('config')
  const [viewMode, setViewMode] = useState<'normal' | 'fullscreen'>('normal')
  const [currentLevel, setCurrentLevel] = useState(0)
  const [count, setCount] = useState(0)
  const [rate, setRate] = useState(0)
  const [isTriggered, setIsTriggered] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameIdRef = useRef<number>(0)
  const lastTriggerTimeRef = useRef(0)
  const triggerTimestampsRef = useRef<number[]>([])

  const requestPermission = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      setHasPermission(true)
      setError('')
      initAudio()
    } catch (e: unknown) {
      console.error(e)
      setError('Could not access microphone. Please check permissions.')
    }
  }

  const initAudio = () => {
    if (!streamRef.current) return

    audioContextRef.current = new AudioContext()
    const source = audioContextRef.current.createMediaStreamSource(streamRef.current)
    analyserRef.current = audioContextRef.current.createAnalyser()
    
    analyserRef.current.fftSize = 256
    analyserRef.current.smoothingTimeConstant = 0.5
    
    source.connect(analyserRef.current)
    startLoop()
  }

  const startLoop = () => {
    const loop = () => {
      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.fftSize)
        analyserRef.current.getByteTimeDomainData(data)
        
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / data.length)
        const level = Math.min(100, rms * 400)

        setCurrentLevel(level)
      }
      frameIdRef.current = requestAnimationFrame(loop)
    }
    frameIdRef.current = requestAnimationFrame(loop)
  }

  const checkThreshold = useCallback((level: number) => {
    if (status !== 'active') return

    const now = Date.now()

    if (level > threshold && (now - lastTriggerTimeRef.current > cooldown)) {
      setCount(c => c + 1)
      lastTriggerTimeRef.current = now
      setIsTriggered(true)
      
      triggerTimestampsRef.current.push(now)
      
      setTimeout(() => setIsTriggered(false), 150)
    }

    // Rate Calculation (Rolling 1s window)
    const cutoff = now - 1000
    triggerTimestampsRef.current = triggerTimestampsRef.current.filter(t => t > cutoff)
    setRate(triggerTimestampsRef.current.length)
  }, [status, threshold, cooldown])

  useEffect(() => {
    if (status === 'active') {
      checkThreshold(currentLevel)
    }
  }, [currentLevel, status, checkThreshold])

  useEffect(() => {
    requestPermission()
    
    return () => {
      cancelAnimationFrame(frameIdRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const start = () => {
    setStatus('active')
    setCount(0)
    triggerTimestampsRef.current = []
    setRate(0)
  }

  const reset = () => {
    setCount(0)
    triggerTimestampsRef.current = []
    setRate(0)
  }

  const stop = () => {
    setStatus('config')
    setViewMode('normal')
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-enter">
        <div className="w-full bg-[#151A23] rounded-3xl p-8 shadow-xl border border-white/5 text-center transition-all relative overflow-hidden">
          
          {/* Header */}
          <div className="w-20 h-20 bg-[#0B0E14] rounded-full flex items-center justify-center mx-auto mb-6 text-[#3B82F6] border border-white/5 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Sound Counter</h1>
          <p className="text-[#94A3B8] mb-8">Increments counter when sound exceeds threshold.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 rounded-xl border border-red-900/30">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button onClick={requestPermission} className="text-sm font-bold text-[#3B82F6] hover:underline">Retry Permission</button>
            </div>
          )}

          {/* Config Mode */}
          {status === 'config' && (
            <div className="space-y-6 mb-8 text-left animate-enter">
              {/* Visualization */}
              <div className="bg-[#0B0E14] p-4 rounded-xl relative overflow-hidden h-16 flex items-center justify-center border border-white/5">
                <div
                  className="absolute inset-y-0 left-0 bg-[#3B82F6] opacity-30 transition-[width] duration-75 ease-linear"
                  style={{ width: `${currentLevel}%` }}
                ></div>
                <div className="absolute inset-y-0 w-0.5 bg-red-500 z-10" style={{ left: `${threshold}%` }}></div>
                <span className="relative z-20 font-mono font-bold text-[#F1F5F9] mix-blend-screen">Level: {Math.round(currentLevel)}</span>
              </div>

              {/* Threshold Slider */}
              <div>
                <label className="flex justify-between text-sm font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">
                  <span>Threshold</span>
                  <span>{threshold}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                />
                <p className="text-xs text-[#64748B] mt-2">Adjust until the bar stays below the red line when silent.</p>
              </div>

              {/* Cooldown Slider */}
              <div>
                <label className="flex justify-between text-sm font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">
                  <span>Cooldown (ms)</span>
                  <span>{cooldown}</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={cooldown}
                  onChange={(e) => setCooldown(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                />
              </div>
            </div>
          )}

          {status === 'config' && (
            <button onClick={start} className="w-full py-4 rounded-xl bg-[#3B82F6] text-white font-bold hover:bg-[#2563EB] hover-spring shadow-lg transition-colors">
              Start Counting
            </button>
          )}

          {/* Active Mode */}
          {status === 'active' && (
            <div className="animate-enter">
              <div className="relative flex flex-col items-center justify-center">
                <div className={`text-[8rem] leading-none font-black tabular-nums transition-all duration-75 select-none ${isTriggered ? 'scale-110 text-[#10B981]' : 'text-[#F1F5F9]'}`}>
                  {count}
                </div>

                {/* Rate Display */}
                <div className="text-xl font-bold text-[#64748B] mb-2 tabular-nums">
                  {rate}/s
                </div>

                {isTriggered && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-full rounded-full bg-[#10B981]/20 animate-ping"></div>
                  </div>
                )}

                {/* Fullscreen Toggle */}
                <button onClick={() => setViewMode('fullscreen')} className="mt-2 mb-8 p-3 rounded-full text-[#64748B] hover:bg-[#2A3441] hover:text-[#F1F5F9] transition-colors" title="Fullscreen Display">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                </button>
              </div>

              {/* Mini Visualizer */}
              <div className="w-full h-2 bg-[#0B0E14] rounded-full overflow-hidden mb-8 relative border border-white/5">
                <div className="absolute inset-y-0 left-0 bg-[#3B82F6] transition-[width] duration-75" style={{ width: `${currentLevel}%` }}></div>
                <div className="absolute inset-y-0 w-0.5 bg-red-500 z-10" style={{ left: `${threshold}%` }}></div>
              </div>

              <div className="flex gap-4">
                <button onClick={reset} className="flex-1 py-3 rounded-xl bg-[#2A3441] text-[#94A3B8] font-bold hover:bg-[#334155] btn-press transition-colors">
                  Reset
                </button>
                <button onClick={stop} className="flex-1 py-3 rounded-xl bg-[#64748B] text-white font-bold hover:bg-[#475569] btn-press transition-colors">
                  Stop
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {viewMode === 'fullscreen' && (
        <div className="fixed inset-0 z-50 bg-[#0B0E14] flex flex-col items-center justify-center animate-enter">
          <button onClick={() => setViewMode('normal')} className="absolute top-6 right-6 p-4 bg-[#151A23] rounded-full text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#2A3441] transition-all shadow-sm border border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>

          <div className={`text-[25vw] font-black tabular-nums leading-none transition-all duration-75 select-none ${isTriggered ? 'scale-110 text-[#10B981]' : 'text-[#F1F5F9]'}`}>
            {count}
          </div>
          <div className="text-[5vw] font-bold text-[#64748B] tabular-nums mt-4 opacity-70">
            {rate}/s
          </div>
        </div>
      )}
    </>
  )
}
