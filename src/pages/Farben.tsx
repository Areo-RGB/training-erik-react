import { useState, useEffect, useRef, useCallback } from 'react'
import { useAudio } from '../hooks/useAudio'
import { useLocalStorageNumber, useLocalStorageBoolean, useLocalStorageString } from '../hooks/useLocalStorage'
import { useMicrophoneInput } from '../hooks/useMicrophoneInput'
import { Toggle, SliderControl, NumberStepper, SoundLevelIndicator, MicrophoneSelector } from '../components/ui'
import { AUDIO, FARBEN } from '../constants'

// Color configuration for Background-Color based Stroop (Card Style)
const COLORS = {
  white: { id: 'white', label: 'White', german: 'weiß', bgClass: 'bg-gray-100' },
  red: { id: 'red', label: 'Red', german: 'rot', bgClass: 'bg-red-600' },
  blue: { id: 'blue', label: 'Blue', german: 'blau', bgClass: 'bg-blue-600' },
  green: { id: 'green', label: 'Green', german: 'grün', bgClass: 'bg-green-600' },
  yellow: { id: 'yellow', label: 'Yellow', german: 'gelb', bgClass: 'bg-yellow-400' }
} as const
type ColorKey = keyof typeof COLORS
const colorKeys = Object.keys(COLORS) as ColorKey[]

export default function Farben() {
  const { playBeep, resumeAudioContext } = useAudio()

  // Game state
  const [status, setStatus] = useState<'config' | 'playing' | 'finished'>('config')
  const [currentColor, setCurrentColor] = useState<ColorKey>('white')
  const [currentStepCount, setCurrentStepCount] = useState(0)

  // Standard mode settings
  const [intervalMs, setIntervalMs] = useLocalStorageNumber('farben_interval', FARBEN.DEFAULT_INTERVAL_MS)
  const [limitSteps, setLimitSteps] = useLocalStorageNumber('farben_steps', FARBEN.DEFAULT_STEPS)
  const [playSound, setPlaySound] = useLocalStorageBoolean('farben_playSound', false)

  // Sound control mode settings
  const [soundControlMode, setSoundControlMode] = useLocalStorageBoolean('farben_soundControlMode', false)
  const [totalDurationSec, setTotalDurationSec] = useLocalStorageNumber('farben_totalDuration', FARBEN.DEFAULT_DURATION_SEC)
  const [timeLeft, setTimeLeft] = useState(0)
  const [waitingForFirstSound, setWaitingForFirstSound] = useState(false)

  // Sound counter settings
  const [useSoundCounter, setUseSoundCounter] = useLocalStorageBoolean('farben_useSoundCounter', false)
  const [soundThreshold, setSoundThreshold] = useLocalStorageNumber('farben_soundThreshold', AUDIO.DEFAULT_THRESHOLD)
  const [soundCooldown, setSoundCooldown] = useLocalStorageNumber('farben_soundCooldown', AUDIO.DEFAULT_COOLDOWN)
  const [soundCount, setSoundCount] = useState(0)

  // Device selection
  const [storedDeviceId, setStoredDeviceId] = useLocalStorageString('farben_selectedDeviceId', 'default')

  // Refs
  const intervalRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const stepRef = useRef<((force?: boolean) => void) | null>(null)
  const startDurationTimerRef = useRef<(() => void) | null>(null)

  const displayConfig = COLORS[currentColor]

  // Microphone hook - only active when sound features enabled
  const micEnabled = (useSoundCounter || soundControlMode) && status !== 'finished'
  
  const mic = useMicrophoneInput({
    initialDeviceId: storedDeviceId,
    threshold: soundThreshold,
    cooldown: soundCooldown,
    autoStart: false,
  })

  // Sync settings to mic hook
  useEffect(() => {
    mic.setThreshold(soundThreshold)
  }, [soundThreshold]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mic.setCooldown(soundCooldown)
  }, [soundCooldown]) // eslint-disable-line react-hooks/exhaustive-deps

  // Start/stop mic based on enabled state
  useEffect(() => {
    if (micEnabled) {
      mic.start()
    } else {
      mic.stop()
    }
  }, [micEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle device selection
  const handleDeviceChange = async (deviceId: string) => {
    setStoredDeviceId(deviceId)
    await mic.selectDevice(deviceId)
  }

  // --- Game Loop Logic ---

  const stopGame = useCallback(() => {
    setStatus('finished')
    setWaitingForFirstSound(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startDurationTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopGame])

  // Expose to ref for sound trigger
  useEffect(() => {
    startDurationTimerRef.current = startDurationTimer
  }, [startDurationTimer])

  const step = useCallback((force: boolean = false) => {
    setCurrentStepCount(prevCount => {
      if (!soundControlMode && !force && prevCount >= limitSteps) {
        stopGame()
        return prevCount
      }
      return prevCount + 1
    })

    // Pick next color (different from current)
    setCurrentColor(prevColor => {
      const candidates = colorKeys.filter(c => c !== prevColor)
      const pool = candidates.length > 0 ? candidates : colorKeys
      return pool[Math.floor(Math.random() * pool.length)]
    })

    if (playSound) {
      playBeep(600, 0.05, 0.1)
    }
  }, [soundControlMode, limitSteps, playSound, playBeep, stopGame])

  // Expose step to ref
  useEffect(() => {
    stepRef.current = step
  }, [step])

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(() => step(), intervalMs)
  }, [intervalMs, step])

  // Handle sound triggers from mic - responding to external audio input
  useEffect(() => {
    if (status !== 'playing' || !mic.isTriggered) return

    setSoundCount(c => c + 1) // eslint-disable-line react-hooks/set-state-in-effect

    if (soundControlMode && waitingForFirstSound) {
      // First sound detected: Start game
      setWaitingForFirstSound(false)
      if (startDurationTimerRef.current) startDurationTimerRef.current()
      if (stepRef.current) stepRef.current(true)
      return
    }

    // In sound control mode, trigger color change on each sound
    if (soundControlMode) {
      if (stepRef.current) stepRef.current()
    }
  }, [mic.isTriggered, status, soundControlMode, waitingForFirstSound])

  const startGame = async () => {
    await resumeAudioContext()
    setStatus('playing')
    setCurrentStepCount(0)
    setSoundCount(0)

    if (soundControlMode) {
      setTimeLeft(totalDurationSec)
      setWaitingForFirstSound(true)
      setCurrentColor('white')
    } else {
      startInterval()
      step()
    }
  }

  const toggleSoundControlMode = () => {
    setSoundControlMode(!soundControlMode)
    if (!soundControlMode) {
      setUseSoundCounter(true) // Force mic on when enabling Sound Control
    }
  }

  // --- Render ---

  // Config Mode
  if (status === 'config') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-enter px-4">
        <div className="w-full max-w-md lg:max-w-xl bg-[#151A23] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xl border border-white/5 transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9]">Farben</h1>
              <p className="text-xs sm:text-sm text-[#94A3B8]">Stroop-Effekt Trainer</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0B0E14] border border-white/5 rounded-xl flex items-center justify-center text-[#3B82F6] shadow-inner shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="sm:w-[24px] sm:h-[24px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Game Mode Toggle */}
            <Toggle
              enabled={soundControlMode}
              onChange={toggleSoundControlMode}
              label="Sound Steuerung"
              description="Farbe wechselt bei Geräusch"
              className="touch-manipulation active:scale-[0.98]"
            />

            {/* Settings Block */}
            <div className="w-full bg-[#0B0E14] rounded-xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 border border-white/5 animate-enter">
              {!soundControlMode ? (
                <>
                  <NumberStepper
                    label="Geschwindigkeit (ms)"
                    value={intervalMs}
                    onChange={setIntervalMs}
                    step={500}
                    min={FARBEN.INTERVAL_MIN}
                  />
                  <NumberStepper
                    label="Anzahl Änderungen"
                    value={limitSteps}
                    onChange={setLimitSteps}
                    step={5}
                    min={FARBEN.STEPS_MIN}
                  />
                </>
              ) : (
                <NumberStepper
                  label="Dauer (Sekunden)"
                  value={totalDurationSec}
                  onChange={setTotalDurationSec}
                  step={5}
                  min={FARBEN.DURATION_MIN}
                />
              )}
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              <Toggle
                enabled={playSound}
                onChange={setPlaySound}
                label="Sound Feedback"
                description="Piep bei Wechsel"
                className="touch-manipulation active:scale-[0.98]"
              />

              <div className={`bg-[#0B0E14] border border-white/5 rounded-xl transition-colors hover:bg-[#151A23]/50 ${soundControlMode ? 'opacity-80' : ''}`}>
                <Toggle
                  enabled={useSoundCounter}
                  onChange={(v) => !soundControlMode && setUseSoundCounter(v)}
                  label="Sound-Zähler / Input"
                  description="Zählt bei Lärm hoch"
                  className={soundControlMode ? 'pointer-events-none' : 'touch-manipulation active:scale-[0.98]'}
                />

                {useSoundCounter && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 animate-enter border-t border-white/5 mt-2 pointer-events-auto">
                    <div className="pt-3 space-y-3">
                      {/* Visualizer */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                          <span>Input Level</span>
                        </div>
                        <SoundLevelIndicator level={mic.level} threshold={soundThreshold} />
                      </div>

                      {/* Threshold & Cooldown Sliders */}
                      <SliderControl
                        label="Schwellenwert"
                        value={soundThreshold}
                        onChange={setSoundThreshold}
                        min={AUDIO.THRESHOLD_MIN}
                        max={AUDIO.THRESHOLD_MAX}
                        size="sm"
                      />
                      <SliderControl
                        label="Cooldown"
                        value={soundCooldown}
                        onChange={setSoundCooldown}
                        min={AUDIO.COOLDOWN_MIN}
                        max={AUDIO.COOLDOWN_MAX}
                        step={AUDIO.COOLDOWN_STEP}
                        unit="ms"
                        size="sm"
                      />

                      {/* Mic Selector */}
                      {mic.devices.length > 0 && (
                        <MicrophoneSelector
                          devices={mic.devices}
                          selectedId={mic.selectedDeviceId}
                          onSelect={handleDeviceChange}
                          isLoading={mic.isLoading}
                        />
                      )}

                      {mic.error && (
                        <div className="text-xs text-red-400 font-medium bg-red-900/10 p-2 rounded">
                          {mic.error}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={startGame} className="w-full mt-6 sm:mt-8 bg-[#3B82F6] text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold shadow-lg hover-spring transition-all hover:bg-[#2563EB] touch-manipulation">
              Training Starten
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Playing or Finished Mode
  return (
    <div className={`fixed inset-0 z-50 flex flex-col h-full transition-colors duration-300 animate-enter ${displayConfig.bgClass}`}>
      
      {/* Controls */}
      <div className="absolute top-16 right-2 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-30 flex gap-2 sm:gap-4 lg:gap-6">
        {status === 'playing' ? (
          <button
            onClick={stopGame}
            className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white font-medium transition-all border border-white/10 shadow-lg touch-manipulation"
          >
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-400 group-hover:animate-pulse"></div>
            <span className="text-xs sm:text-base">Stopp</span>
          </button>
        ) : (
          <button
            onClick={() => setStatus('config')}
            className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white font-medium transition-all border border-white/10 shadow-lg touch-manipulation"
          >
            <span className="text-xs sm:text-base">Menü</span>
          </button>
        )}
      </div>

      {/* Progress Counter or Timer */}
      {status === 'playing' && (
        <div className="absolute top-16 left-2 sm:top-6 sm:left-6 z-30">
          <div className="px-3 sm:px-4 py-1 sm:py-2 bg-black/30 backdrop-blur-md rounded-full text-white/80 font-mono font-bold border border-white/10 text-xs sm:text-base">
            {soundControlMode ? `${timeLeft}s` : `${currentStepCount} / ${limitSteps}`}
          </div>
        </div>
      )}

      {/* Waiting for First Sound Overlay */}
      {status === 'playing' && soundControlMode && waitingForFirstSound && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm animate-enter">
          <div className="text-center p-6">
            <div className="w-24 h-24 bg-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Bereit?</h2>
            <p className="text-[#94A3B8] text-lg">Mache ein Geräusch, um zu starten!</p>
          </div>
        </div>
      )}

      {/* Sound Counter Overlay */}
      {useSoundCounter && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <span 
            className="text-[10rem] sm:text-[15rem] md:text-[20rem] font-black text-white leading-none select-none tabular-nums" 
            style={{ WebkitTextStroke: '4px black', textShadow: '0 4px 20px rgba(0,0,0,0.5)', paintOrder: 'stroke fill' }}
          >
            {soundCount}
          </span>
        </div>
      )}

      {/* Finished State Overlay */}
      {status === 'finished' && (
        <div className="absolute inset-x-0 bottom-20 sm:bottom-32 flex justify-center z-50 animate-enter">
          <button 
            onClick={startGame}
            className="bg-white text-black px-8 py-4 rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
            </svg>
            Noch einmal
          </button>
        </div>
      )}
    </div>
  )
}
