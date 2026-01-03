import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocalStorageNumber, useLocalStorageString } from '../hooks/useLocalStorage'

export default function SoundCounter() {
  const [threshold, setThreshold] = useLocalStorageNumber('sound_counter_threshold', 50)
  const [cooldown, setCooldown] = useLocalStorageNumber('sound_counter_cooldown', 500)
  const [selectedDeviceId, setSelectedDeviceId] = useLocalStorageString('sound_counter_device_id', 'default')
  const [fontSize, setFontSize] = useLocalStorageNumber('sound_counter_fontSize', 8)
  
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'config' | 'active'>('config')
  const [isLoadingDevice, setIsLoadingDevice] = useState(false)
  const [viewMode, setViewMode] = useState<'normal' | 'fullscreen'>('normal')
  const [currentLevel, setCurrentLevel] = useState(0)
  const [count, setCount] = useState(0)
  const [rate, setRate] = useState(0)
  const [isTriggered, setIsTriggered] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameIdRef = useRef<number>(0)
  const lastTriggerTimeRef = useRef(0)
  const triggerTimestampsRef = useRef<number[]>([])

  const adjustFontSize = (delta: number) => setFontSize(Math.max(4, fontSize + delta))

  const getDevices = useCallback(async () => {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices()
      const audioDevs = devs.filter(d => d.kind === 'audioinput')
      setDevices(audioDevs)
      
      // If the stored device ID is no longer available, default to the first one
      if (selectedDeviceId !== 'default' && !audioDevs.find(d => d.deviceId === selectedDeviceId)) {
        setSelectedDeviceId('default')
      }
    } catch (e) {
      console.error('Error listing devices:', e)
    }
  }, [selectedDeviceId, setSelectedDeviceId])

  useEffect(() => {
    if (hasPermission) {
      getDevices()
      navigator.mediaDevices.addEventListener('devicechange', getDevices)
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', getDevices)
      }
    }
  }, [hasPermission, getDevices])

  const requestPermission = async () => {
    try {
      // If we have a stored preference, try to use it. Otherwise use default.
      const constraints = selectedDeviceId && selectedDeviceId !== 'default' 
        ? { audio: { deviceId: { exact: selectedDeviceId } } } 
        : { audio: true }

      streamRef.current = await navigator.mediaDevices.getUserMedia(constraints)
      setHasPermission(true)
      setError('')
      initAudio()
    } catch (e: unknown) {
      console.error(e)
      // Retry with default if specific device failed
      if (selectedDeviceId !== 'default') {
        setSelectedDeviceId('default')
        // We need to wait a bit or just retry immediately? 
        // Calling requestPermission again might be recursive loop if default also fails, 
        // but 'default' usually shouldn't fail unless no mic.
        try {
           streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
           setHasPermission(true)
           setError('')
           initAudio()
           return
        } catch (retryErr) {
           console.error(retryErr)
        }
      }
      setError('Could not access microphone. Please check permissions.')
    }
  }

  const initAudio = () => {
    if (!streamRef.current) return

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    audioContextRef.current = new AudioContext()
    const source = audioContextRef.current.createMediaStreamSource(streamRef.current)
    analyserRef.current = audioContextRef.current.createAnalyser()
    
    analyserRef.current.fftSize = 256
    analyserRef.current.smoothingTimeConstant = 0.5
    
    source.connect(analyserRef.current)
    startLoop()
  }

  const startLoop = () => {
    // Cancel any existing loop
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current)
    }

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

  const handleDeviceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value
    setSelectedDeviceId(deviceId)
    setIsLoadingDevice(true)
    setError('')
    
    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    
    try {
      const constraints = deviceId === 'default' 
        ? { audio: true } 
        : { audio: { deviceId: { exact: deviceId } } }
      
      streamRef.current = await navigator.mediaDevices.getUserMedia(constraints)
      initAudio()
    } catch (err) {
      console.error('Error switching device:', err)
      setError('Could not switch microphone.')
    } finally {
      setIsLoadingDevice(false)
    }
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
        <div className="w-full max-w-md lg:max-w-xl mx-auto bg-[#151A23] rounded-3xl p-8 lg:p-10 shadow-xl border border-white/5 text-center transition-all relative overflow-hidden">
          
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

              {/* Microphone Selection */}
              <div>
                <label className="block text-sm font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">
                  Microphone {isLoadingDevice && <span className="text-[#3B82F6] animate-pulse">• Switching...</span>}
                </label>
                <div className="relative">
                  <select
                    value={selectedDeviceId}
                    onChange={handleDeviceChange}
                    disabled={isLoadingDevice}
                    className={`w-full bg-[#0B0E14] text-[#F1F5F9] border border-white/10 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-[#3B82F6] transition-colors ${isLoadingDevice ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <option value="default">Default</option>
                    {devices.map((device) => (
                       <option key={device.deviceId} value={device.deviceId}>
                         {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                       </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]">
                    {isLoadingDevice ? (
                      <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    )}
                  </div>
                </div>
                {devices.length === 0 && hasPermission && (
                  <p className="text-xs text-amber-400 mt-2">No microphones detected. Please connect a microphone.</p>
                )}
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
                <div 
                  style={{ fontSize: `${fontSize}rem` }}
                  className={`leading-none font-black tabular-nums transition-all duration-75 select-none ${isTriggered ? 'scale-110 text-[#10B981]' : 'text-[#F1F5F9]'}`}
                >
                  {count}
                </div>

                {/* Rate Display */}
                <div className="text-xl font-bold text-[#64748B] mb-2 tabular-nums">
                  {rate}/s
                </div>
                
                {/* Font Size Controls */}
                <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity mt-2">
                  <button onClick={() => adjustFontSize(-1)} className="p-2 rounded-full bg-[#0B0E14] text-[#94A3B8] hover:bg-[#2A3441] btn-press border border-white/10">-</button>
                  <button onClick={() => adjustFontSize(1)} className="p-2 rounded-full bg-[#0B0E14] text-[#94A3B8] hover:bg-[#2A3441] btn-press border border-white/10">+</button>
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
          <button onClick={() => setViewMode('normal')} className="absolute top-16 right-6 sm:top-6 sm:right-6 lg:top-8 lg:right-8 p-4 bg-[#151A23] rounded-full text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#2A3441] transition-all shadow-sm border border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>

          <div
            style={{ fontSize: `clamp(5rem, ${Math.max(fontSize * 2, 15)}vw, 20rem)` }}
            className={`font-black tabular-nums leading-none transition-all duration-75 select-none ${isTriggered ? 'scale-110 text-[#10B981]' : 'text-[#F1F5F9]'}`}
          >
            {count}
          </div>
          <div className="text-[5vw] font-bold text-[#64748B] tabular-nums mt-4 opacity-70">
            {rate}/s
          </div>
          
          {/* Font Size Controls */}
          <div className="absolute bottom-8 flex items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
            <button onClick={() => adjustFontSize(-1)} className="p-3 rounded-full bg-[#151A23] text-[#94A3B8] hover:bg-[#2A3441] btn-press border border-white/10">-</button>
            <button onClick={() => adjustFontSize(1)} className="p-3 rounded-full bg-[#151A23] text-[#94A3B8] hover:bg-[#2A3441] btn-press border border-white/10">+</button>
          </div>
        </div>
      )}
    </>
  )
}
