import { useState, useEffect, useRef, useCallback } from 'react'
import { useAudio } from '../hooks/useAudio'
import { useLocalStorageNumber, useLocalStorageBoolean, useLocalStorageString } from '../hooks/useLocalStorage'
import { useInterval } from '../hooks/useInterval'

// Configuration for Background-Color based Stroop (Card Style)
const COLORS = {
  white: { id: 'white', label: 'White', german: 'weiß', bgClass: 'bg-gray-100' },
  red: { id: 'red', label: 'Red', german: 'rot', bgClass: 'bg-red-600' },
  blue: { id: 'blue', label: 'Blue', german: 'blau', bgClass: 'bg-blue-600' },
  green: { id: 'green', label: 'Green', german: 'grün', bgClass: 'bg-green-600' },
  yellow: { id: 'yellow', label: 'Yellow', german: 'gelb', bgClass: 'bg-yellow-400' }
}
type ColorKey = keyof typeof COLORS

export default function Farben() {
  const { playBeep, resumeAudioContext } = useAudio()

  const [status, setStatus] = useState<'config' | 'playing'>('config')
  const [currentColor, setCurrentColor] = useState<ColorKey>('white')
  const [currentStepCount, setCurrentStepCount] = useState(0)

  // Game Logic (Standard)
  const [intervalMs, setIntervalMs] = useLocalStorageNumber('farben_interval', 2000)
  const [limitSteps, setLimitSteps] = useLocalStorageNumber('farben_steps', 10)
  const [playSound, setPlaySound] = useLocalStorageBoolean('farben_playSound', false)

  // Game Logic (Sound Control Mode)
  const [soundControlMode, setSoundControlMode] = useLocalStorageBoolean('farben_soundControlMode', false)
  const [totalDurationSec, setTotalDurationSec] = useLocalStorageNumber('farben_totalDuration', 20)
  const [timeLeft, setTimeLeft] = useState(0)
  const [waitingForFirstSound, setWaitingForFirstSound] = useState(false)

  // Sound Counter Logic
  const [useSoundCounter, setUseSoundCounter] = useLocalStorageBoolean('farben_useSoundCounter', false)
  const [soundThreshold, setSoundThreshold] = useLocalStorageNumber('farben_soundThreshold', 50)
  const [soundCooldown, setSoundCooldown] = useLocalStorageNumber('farben_soundCooldown', 500)
  const [soundCount, setSoundCount] = useState(0)
  const [currentSoundLevel, setCurrentSoundLevel] = useState(0)
  const [micError, setMicError] = useState('')

  // Audio Device Handling
  const [selectedDeviceId, setSelectedDeviceId] = useLocalStorageString('farben_selectedDeviceId', 'default')
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])

  const intervalRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  
  const colorKeys = Object.keys(COLORS) as ColorKey[]
  const displayConfig = COLORS[currentColor]

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const requestRef = useRef<number>()
  const lastTriggerTimeRef = useRef(0)

  // Helpers
  const adjustSteps = (delta: number) => setLimitSteps(Math.max(5, limitSteps + delta))
  const adjustInterval = (delta: number) => setIntervalMs(Math.max(500, intervalMs + delta))
  const adjustDuration = (delta: number) => setTotalDurationSec(Math.max(5, totalDurationSec + delta))

  const toggleSoundControlMode = () => {
    setSoundControlMode(!soundControlMode)
    if (!soundControlMode) {
      setUseSoundCounter(true) // Force mic on when enabling Sound Control
    }
  }

  // --- Audio System ---

  const stopAudio = useCallback(() => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setCurrentSoundLevel(0)
  }, [])

  const loadDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const mics = devices.filter(d => d.kind === 'audioinput')
      setAvailableDevices(mics)
      
      if (mics.length > 0) {
        const current = selectedDeviceId
        const exists = mics.find(d => d.deviceId === current)
        if (current === 'default' || !exists) {
           // Keep default or switch to first available if stored is invalid
           if (current !== 'default') setSelectedDeviceId(mics[0].deviceId)
        }
      }
    } catch (e) {
      console.error('Error enumerating devices:', e)
    }
  }, [selectedDeviceId, setSelectedDeviceId])

  // Refs for loop
  const soundThresholdRef = useRef(soundThreshold)
  const soundCooldownRef = useRef(soundCooldown)
  const statusRef = useRef(status)
  const soundControlModeRef = useRef(soundControlMode)
  const waitingForFirstSoundRef = useRef(waitingForFirstSound)

  // Sync refs
  useEffect(() => {
    soundThresholdRef.current = soundThreshold
    soundCooldownRef.current = soundCooldown
    statusRef.current = status
    soundControlModeRef.current = soundControlMode
    waitingForFirstSoundRef.current = waitingForFirstSound
  }, [soundThreshold, soundCooldown, status, soundControlMode, waitingForFirstSound])

  // Need a stable reference to step for the audio loop
  const stepRef = useRef<((force?: boolean) => void) | null>(null)
  const startDurationTimerRef = useRef<(() => void) | null>(null)

  const checkAudioLevel = useCallback(() => {
    if (!analyserRef.current) return

    const data = new Uint8Array(analyserRef.current.fftSize)
    analyserRef.current.getByteTimeDomainData(data)

    let sum = 0
    for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sum += v * v
    }
    const rms = Math.sqrt(sum / data.length)
    const level = Math.min(100, rms * 400)
    
    setCurrentSoundLevel(level)

    if (statusRef.current === 'playing') {
        const now = Date.now()
        if (level > soundThresholdRef.current && (now - lastTriggerTimeRef.current > soundCooldownRef.current)) {
            lastTriggerTimeRef.current = now
            
            if (soundControlModeRef.current && waitingForFirstSoundRef.current) {
                // First sound detected: Start game
                setWaitingForFirstSound(false)
                if (startDurationTimerRef.current) startDurationTimerRef.current()
                if (stepRef.current) stepRef.current(true) // First color change
                setSoundCount(c => c + 1)
                return
            }

            setSoundCount(c => c + 1)

            // If Sound Control Mode is ON, trigger color change
            if (soundControlModeRef.current) {
                if (stepRef.current) stepRef.current()
            }
        }
    }
    
    requestRef.current = requestAnimationFrame(checkAudioLevel)
  }, [])

  const initAudio = useCallback(async () => {
    stopAudio()
    try {
      setMicError('')
      const constraints = {
        audio: selectedDeviceId && selectedDeviceId !== 'default'
          ? { deviceId: { exact: selectedDeviceId } }
          : true
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      loadDevices()
      
      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx
      
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.5
      analyserRef.current = analyser
      
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      
      checkAudioLevel()
    } catch (e) {
      console.error('Mic access error', e)
      setMicError('Mikrofonzugriff verweigert.')
      setUseSoundCounter(false)
      setSoundControlMode(false)
    }
  }, [selectedDeviceId, loadDevices, stopAudio, checkAudioLevel, setUseSoundCounter, setSoundControlMode])

  // Manage Audio Lifecycle
  useEffect(() => {
     if (status === 'config') {
         if (useSoundCounter || soundControlMode) {
             initAudio()
         } else {
             stopAudio()
         }
     }
  }, [status, useSoundCounter, soundControlMode, initAudio, stopAudio])
  
  // Also stop audio on unmount
  useEffect(() => {
      return () => stopAudio()
  }, [stopAudio])

  
  // --- Game Loop Logic ---

  const stopGame = useCallback(() => {
    setStatus('config')
    setWaitingForFirstSound(false)
    
    if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
    }
    if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
    }

    // Keep audio if configured to show visualization in config
    if (!useSoundCounter && !soundControlMode) {
        stopAudio()
    }
  }, [useSoundCounter, soundControlMode, stopAudio])

  const startDurationTimer = useCallback(() => {
      if (timerRef.current) clearInterval(timerRef.current)
      
      timerRef.current = window.setInterval(() => {
          setTimeLeft(prev => {
              if (prev <= 1) { // 1 because we are about to decrement to 0
                  stopGame()
                  return 0
              }
              return prev - 1
          })
      }, 1000)
  }, [stopGame])
  
  // Expose to ref for audio loop
  useEffect(() => {
      startDurationTimerRef.current = startDurationTimer
  }, [startDurationTimer])

  const step = useCallback((force: boolean = false) => {
      // In Standard Mode, check limit
      // We pass the current value via functional update or check before?
      // Since this is a callback, we need fresh state OR use functional update carefully.
      // But we can't conditionally stopGame inside a functional update easily.
      // Let's rely on refs for state in callbacks if needed, or simple checks.
      
      // Note: React state updates are async. Using refs for immediate checks in loop is safer.
      // But let's check basic logic.
      
      setCurrentStepCount(prevCount => {
          if (!soundControlMode && !force && prevCount >= limitSteps) {
              stopGame()
              return prevCount
          }
           return prevCount + 1
      })

      // Pick Color
      setCurrentColor(prevColor => {
         const candidates = colorKeys.filter(c => c !== prevColor)
         const pool = candidates.length > 0 ? candidates : colorKeys
         const next = pool[Math.floor(Math.random() * pool.length)]
         return next
      })

      if (playSound) {
          playBeep(600, 0.05, 0.1) // 0.1s duration
      }
  }, [soundControlMode, limitSteps, colorKeys, playSound, playBeep, stopGame])

  // Expose step to ref
  useEffect(() => {
      stepRef.current = step
  }, [step])

  const startInterval = useCallback(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = window.setInterval(() => step(), intervalMs)
  }, [intervalMs, step])

  const startGame = async () => {
    await resumeAudioContext()
    setStatus('playing')
    setCurrentStepCount(0)
    setSoundCount(0)
    
    // Audio Setup
    if (useSoundCounter || soundControlMode) {
        // Init happens automatically in effect usually, or we ensure it's running
        // If it was already running in config, fine. If not (weird state), restart.
        // Actually initAudio checks refs, so calling it again is safe-ish but might restart stream.
        // Better:
        if (!audioContextRef.current) {
            initAudio()
        }
        // Ensure checking loop is running (it recycles itself)
    } else {
        stopAudio()
    }

    if (soundControlMode) {
        setTimeLeft(totalDurationSec)
        setWaitingForFirstSound(true)
        setCurrentColor('white')
    } else {
        startInterval()
        step()
    }
  }

  // --- Render ---

  // Config Mode
  if (status === 'config') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-enter px-4">
        <div className="w-full max-w-md bg-[#151A23] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-white/5 transition-all">
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
            <div 
                className="flex items-center justify-between p-3 sm:p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors touch-manipulation active:scale-[0.98]"
                onClick={toggleSoundControlMode}
            >
                <div>
                    <div className="font-semibold text-sm sm:text-base text-[#F1F5F9]">Sound Steuerung</div>
                    <div className="text-[10px] sm:text-xs text-[#94A3B8]">Farbe wechselt bei Geräusch</div>
                </div>
                <button className={`w-11 h-6 sm:w-12 sm:h-7 rounded-full transition-colors relative ${soundControlMode ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'}`}>
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${soundControlMode ? 'left-[1.375rem] sm:left-6' : 'left-1'}`}></div>
                </button>
            </div>

            {/* Settings Block */}
            <div className="w-full bg-[#0B0E14] rounded-xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 border border-white/5 animate-enter">
                {!soundControlMode ? (
                    <>
                        {/* Speed Control */}
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Geschwindigkeit (ms)</span>
                            <div className="flex items-center gap-4 sm:gap-6">
                                <button onClick={() => adjustInterval(-500)} disabled={intervalMs <= 500} className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed">-</button>
                                <span className="text-xl sm:text-2xl font-black w-20 sm:w-24 text-center tabular-nums text-[#F1F5F9]">{intervalMs}</span>
                                <button onClick={() => adjustInterval(500)} className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center">+</button>
                            </div>
                        </div>

                        {/* Steps Control */}
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Anzahl Änderungen</span>
                            <div className="flex items-center gap-4 sm:gap-6">
                                <button onClick={() => adjustSteps(-5)} disabled={limitSteps <= 5} className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed">-</button>
                                <span className="text-xl sm:text-2xl font-black w-20 sm:w-24 text-center tabular-nums text-[#F1F5F9]">{limitSteps}</span>
                                <button onClick={() => adjustSteps(5)} className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center">+</button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Duration Control */
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Dauer (Sekunden)</span>
                        <div className="flex items-center gap-4 sm:gap-6">
                            <button onClick={() => adjustDuration(-5)} disabled={totalDurationSec <= 5} className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed">-</button>
                            <span className="text-xl sm:text-2xl font-black w-20 sm:w-24 text-center tabular-nums text-[#F1F5F9]">{totalDurationSec}</span>
                            <button onClick={() => adjustDuration(5)} className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center">+</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Toggles Loop */}
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {/* Play Sound */}
                <div 
                    className="flex items-center justify-between p-3 sm:p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors touch-manipulation active:scale-[0.98]"
                    onClick={() => setPlaySound(!playSound)}
                >
                    <div>
                        <div className="font-semibold text-sm sm:text-base text-[#F1F5F9]">Sound Feedback</div>
                        <div className="text-[10px] sm:text-xs text-[#94A3B8]">Piep bei Wechsel</div>
                    </div>
                    <button className={`w-11 h-6 sm:w-12 sm:h-7 rounded-full transition-colors relative ${playSound ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'}`}>
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${playSound ? 'left-[1.375rem] sm:left-6' : 'left-1'}`}></div>
                    </button>
                </div>

                {/* Sound Counter / Mic Settings */}
                <div 
                    className={`bg-[#0B0E14] border border-white/5 rounded-xl transition-colors hover:bg-[#151A23]/50 ${soundControlMode ? 'opacity-80' : ''}`}
                >
                    <div 
                        className={`flex items-center justify-between p-3 sm:p-4 cursor-pointer ${soundControlMode ? 'pointer-events-none' : ''}`}
                        onClick={() => !soundControlMode && setUseSoundCounter(!useSoundCounter)}
                    >
                        <div>
                            <div className="font-semibold text-sm sm:text-base text-[#F1F5F9]">Sound-Zähler / Input</div>
                            <div className="text-[10px] sm:text-xs text-[#94A3B8]">Zählt bei Lärm hoch</div>
                        </div>
                        <button className={`w-11 h-6 sm:w-12 sm:h-7 rounded-full transition-colors relative ${useSoundCounter ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'}`}>
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${useSoundCounter ? 'left-[1.375rem] sm:left-6' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {useSoundCounter && (
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 animate-enter border-t border-white/5 mt-2 pointer-events-auto">
                            <div className="pt-3 space-y-3">
                                {/* Visualizer */}
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                                        <span>Input Level</span>
                                    </div>
                                    <div className="h-4 bg-[#151A23] rounded-md overflow-hidden border border-white/5 relative">
                                        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${soundThreshold}%` }}></div>
                                        <div 
                                            className="absolute inset-y-0 left-0 bg-emerald-500 transition-[width] duration-75 ease-out opacity-80"
                                            style={{ width: `${currentSoundLevel}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Threshold & Cooldown Sliders */}
                                <div>
                                     <div className="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                                        <span>Schwellenwert: {soundThreshold}</span>
                                     </div>
                                     <input type="range" min="1" max="100" value={soundThreshold} onChange={e => setSoundThreshold(Number(e.target.value))} className="w-full h-1.5 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]" />
                                </div>
                                <div>
                                     <div className="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                                        <span>Cooldown: {soundCooldown}ms</span>
                                     </div>
                                     <input type="range" min="100" max="2000" step="100" value={soundCooldown} onChange={e => setSoundCooldown(Number(e.target.value))} className="w-full h-1.5 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]" />
                                </div>

                                {/* Mic Selector */}
                                {availableDevices.length > 0 && (
                                    <div>
                                         <div className="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                                            <span>Mikrofon</span>
                                         </div>
                                         <div className="relative">
                                             <select 
                                                value={selectedDeviceId} 
                                                onChange={e => setSelectedDeviceId(e.target.value)}
                                                className="w-full bg-[#151A23] text-[#F1F5F9] text-xs font-medium rounded-lg py-2 pl-3 pr-8 border border-white/10 outline-none focus:border-[#3B82F6] appearance-none cursor-pointer hover:bg-[#2A3441] transition-colors"
                                             >
                                                {availableDevices.map((d, i) => (
                                                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Mikrofon ${i+1}`}</option>
                                                ))}
                                             </select>
                                         </div>
                                    </div>
                                )}
                                
                                {micError && <div className="text-xs text-red-400 font-medium bg-red-900/10 p-2 rounded">{micError}</div>}
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

  // Playing Mode
  return (
    <div className={`fixed inset-0 z-50 flex flex-col h-full transition-colors duration-300 animate-enter ${displayConfig.bgClass}`}>
      
      {/* Controls */}
      <div className="absolute top-16 right-2 sm:top-6 sm:right-6 z-30 flex gap-2 sm:gap-4">
        <button
          onClick={stopGame}
          className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white font-medium transition-all border border-white/10 shadow-lg touch-manipulation"
        >
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-400 group-hover:animate-pulse"></div>
          <span className="text-xs sm:text-base">Stopp</span>
        </button>
      </div>

      {/* Progress Counter or Timer */}
      <div className="absolute top-16 left-2 sm:top-6 sm:left-6 z-30">
        <div className="px-3 sm:px-4 py-1 sm:py-2 bg-black/30 backdrop-blur-md rounded-full text-white/80 font-mono font-bold border border-white/10 text-xs sm:text-base">
          {soundControlMode ? `${timeLeft}s` : `${currentStepCount} / ${limitSteps}`}
        </div>
      </div>

      {/* Waiting for First Sound Overlay */}
      {soundControlMode && waitingForFirstSound && (
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

      {/* Sound Counter Overlay (Shown if enabled) */}
      {useSoundCounter && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <span 
                className="text-[10rem] sm:text-[15rem] md:text-[20rem] font-black text-white leading-none select-none tabular-nums" 
                style={{ WebkitTextStroke: '4px black', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
              >
                  {soundCount}
              </span>
          </div>
      )}

    </div>
  )
}
