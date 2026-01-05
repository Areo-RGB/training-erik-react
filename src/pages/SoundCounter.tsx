import { useState, useCallback, useRef } from 'react'
import { useLocalStorageNumber, useLocalStorageString } from '../hooks/useLocalStorage'
import { useMicrophoneInput } from '../hooks/useMicrophoneInput'
import { SliderControl, SoundLevelIndicator, MicrophoneSelector } from '../components/ui'
import { AUDIO, FONT_SIZE, RATE_TRACKING } from '../constants'

export default function SoundCounter() {
  // Persisted settings
  const [threshold, setThreshold] = useLocalStorageNumber('sound_counter_threshold', AUDIO.DEFAULT_THRESHOLD)
  const [cooldown, setCooldown] = useLocalStorageNumber('sound_counter_cooldown', AUDIO.DEFAULT_COOLDOWN)
  const [storedDeviceId, setStoredDeviceId] = useLocalStorageString('sound_counter_device_id', 'default')
  const [fontSize, setFontSize] = useLocalStorageNumber('sound_counter_fontSize', FONT_SIZE.SOUND_COUNTER)

  // UI State
  const [status, setStatus] = useState<'config' | 'active'>('config')
  const [viewMode, setViewMode] = useState<'normal' | 'fullscreen'>('normal')
  const [count, setCount] = useState(0)
  const [rate, setRate] = useState(0)

  // Rate tracking
  const triggerTimestampsRef = useRef<number[]>([])

  // Handle trigger callback
  const handleTrigger = useCallback(() => {
    if (status !== 'active') return

    setCount(c => c + 1)
    const now = Date.now()
    triggerTimestampsRef.current.push(now)

    // Update rate (rolling window) and cap array size to prevent memory leak
    const cutoff = now - RATE_TRACKING.WINDOW_MS
    triggerTimestampsRef.current = triggerTimestampsRef.current
      .filter(t => t > cutoff)
      .slice(-RATE_TRACKING.MAX_TIMESTAMPS)
    setRate(triggerTimestampsRef.current.length)
  }, [status])

  // Microphone hook (reactive to threshold/cooldown changes)
  const mic = useMicrophoneInput({
    initialDeviceId: storedDeviceId,
    threshold,
    cooldown,
    onTrigger: handleTrigger,
    autoStart: true,
  })

  // Handle device selection
  const handleDeviceChange = async (deviceId: string) => {
    setStoredDeviceId(deviceId)
    await mic.selectDevice(deviceId)
  }

  // Actions
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

  const adjustFontSize = (delta: number) => setFontSize(Math.max(FONT_SIZE.MIN, fontSize + delta))

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
          <p className="text-[#94A3B8] mb-8">Erhöht Zähler bei Geräuschen über dem Schwellenwert.</p>

          {mic.error && (
            <div className="mb-6 p-4 bg-red-900/20 rounded-xl border border-red-900/30">
              <p className="text-red-400 text-sm mb-2">{mic.error}</p>
              <button onClick={() => mic.start()} className="text-sm font-bold text-[#3B82F6] hover:underline">
                Erneut versuchen
              </button>
            </div>
          )}

          {/* Config Mode */}
          {status === 'config' && (
            <div className="space-y-6 mb-8 text-left animate-enter">
              {/* Level Visualization */}
              <div className="bg-[#0B0E14] p-4 rounded-xl border border-white/5">
                <SoundLevelIndicator level={mic.level} threshold={threshold} size="lg" showValue />
              </div>

              {/* Microphone Selection */}
              <MicrophoneSelector
                devices={mic.devices}
                selectedId={mic.selectedDeviceId}
                onSelect={handleDeviceChange}
                isLoading={mic.isLoading}
              />

              {/* Threshold Slider */}
              <SliderControl
                label="Schwellenwert"
                value={threshold}
                onChange={setThreshold}
                min={AUDIO.THRESHOLD_MIN}
                max={AUDIO.THRESHOLD_MAX}
              />

              {/* Cooldown Slider */}
              <SliderControl
                label="Cooldown"
                value={cooldown}
                onChange={setCooldown}
                min={AUDIO.COOLDOWN_MIN}
                max={AUDIO.COOLDOWN_MAX}
                step={AUDIO.COOLDOWN_STEP}
                unit="ms"
              />
            </div>
          )}

          {status === 'config' && (
            <button onClick={start} className="w-full py-4 rounded-xl bg-[#3B82F6] text-white font-bold hover:bg-[#2563EB] hover-spring shadow-lg transition-colors">
              Zählen Starten
            </button>
          )}

          {/* Active Mode */}
          {status === 'active' && (
            <div className="animate-enter">
              <div className="relative flex flex-col items-center justify-center">
                <div 
                  style={{ fontSize: `${fontSize}rem` }}
                  className={`leading-none font-black tabular-nums transition-all duration-75 select-none ${mic.isTriggered ? 'scale-110 text-[#10B981]' : 'text-[#F1F5F9]'}`}
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

                {mic.isTriggered && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-full rounded-full bg-[#10B981]/20 animate-ping"></div>
                  </div>
                )}

                {/* Fullscreen Toggle */}
                <button onClick={() => setViewMode('fullscreen')} className="mt-2 mb-8 p-3 rounded-full text-[#64748B] hover:bg-[#2A3441] hover:text-[#F1F5F9] transition-colors" title="Vollbild">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                </button>
              </div>

              {/* Mini Visualizer */}
              <div className="mb-8">
                <SoundLevelIndicator level={mic.level} threshold={threshold} size="sm" />
              </div>

              <div className="flex gap-4">
                <button onClick={reset} className="flex-1 py-3 rounded-xl bg-[#2A3441] text-[#94A3B8] font-bold hover:bg-[#334155] btn-press transition-colors">
                  Reset
                </button>
                <button onClick={stop} className="flex-1 py-3 rounded-xl bg-[#64748B] text-white font-bold hover:bg-[#475569] btn-press transition-colors">
                  Stopp
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
            className={`font-black tabular-nums leading-none transition-all duration-75 select-none ${mic.isTriggered ? 'scale-110 text-[#10B981]' : 'text-[#F1F5F9]'}`}
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
