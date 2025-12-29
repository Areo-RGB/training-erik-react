import { useState, useEffect, useRef, useMemo } from 'react'
import { useAudio } from '../hooks/useAudio'
import { useLocalStorageNumber, useLocalStorageBoolean, useLocalStorage } from '../hooks/useLocalStorage'

const COLORS = {
  white: { id: 'white', label: 'White', bgClass: 'bg-white', textClass: 'text-slate-900' },
  red: { id: 'red', label: 'Red', bgClass: 'bg-red-600', textClass: 'text-white' },
  blue: { id: 'blue', label: 'Blue', bgClass: 'bg-blue-600', textClass: 'text-white' },
  green: { id: 'green', label: 'Green', bgClass: 'bg-green-600', textClass: 'text-white' },
}
type ColorKey = keyof typeof COLORS

export default function Farben() {
  const { playBeep, resumeAudioContext } = useAudio()
  
  const [status, setStatus] = useState<'config' | 'playing'>('config')
  const [currentColor, setCurrentColor] = useState<ColorKey>('white')
  const [currentLabel, setCurrentLabel] = useState('')
  const [currentStepCount, setCurrentStepCount] = useState(0)
  
  const [intervalMs, setIntervalMs] = useLocalStorageNumber('farben_interval', 1000)
  const [limitSteps, setLimitSteps] = useState('')
  const [noColors, setNoColors] = useLocalStorageBoolean('farben_noColors', false)
  const [preventDuplicateWords, setPreventDuplicateWords] = useLocalStorageBoolean('farben_noDuplicates', false)
  const [playSound, setPlaySound] = useLocalStorageBoolean('farben_playSound', false)
  const [customLabels, setCustomLabels] = useLocalStorage<string[]>('farben_customLabels', [''])

  const intervalRef = useRef<number | null>(null)
  const colorKeys = Object.keys(COLORS) as ColorKey[]

  const displayConfig = useMemo(() => {
    const config = COLORS[currentColor]
    if (noColors) {
      return { ...config, bgClass: 'bg-[#0B0E14]', textClass: 'text-white' }
    }
    return config
  }, [currentColor, noColors])

  const validLabels = useMemo(() => customLabels.filter(l => l.trim().length > 0), [customLabels])

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...customLabels]
    newLabels[index] = value
    if (index === newLabels.length - 1 && value.trim() !== '') {
      newLabels.push('')
    }
    setCustomLabels(newLabels)
  }

  const removeLabel = (index: number) => {
    const newLabels = customLabels.filter((_, i) => i !== index)
    if (newLabels.length === 0) newLabels.push('')
    setCustomLabels(newLabels)
  }

  const nextStep = () => {
    const limit = parseInt(limitSteps, 10)
    if (!isNaN(limit) && limit > 0) {
      if (currentStepCount >= limit) {
        stopGame()
        return
      }
    }

    setCurrentStepCount(c => c + 1)

    // Next Color
    const availableColors = colorKeys.filter(c => c !== currentColor)
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
    setCurrentColor(randomColor)

    // Next Label
    if (validLabels.length === 0) {
      setCurrentLabel('')
    } else {
      let candidates = validLabels
      if (preventDuplicateWords && currentLabel && validLabels.length > 1) {
        candidates = validLabels.filter(l => l !== currentLabel)
      }
      const randomLabel = candidates[Math.floor(Math.random() * candidates.length)]
      setCurrentLabel(randomLabel)
    }

    if (playSound) {
      playBeep(800, 0.05, 0.1)
    }
  }

  const startGame = async () => {
    await resumeAudioContext()
    setStatus('playing')
    setCurrentStepCount(0)
    nextStep()
    intervalRef.current = window.setInterval(nextStep, intervalMs)
  }

  const stopGame = () => {
    setStatus('config')
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Config Mode
  if (status === 'config') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-enter">
        <div className="w-full max-w-md bg-[#151A23] rounded-3xl p-8 shadow-xl border border-white/5 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#F1F5F9]">Farben</h1>
              <p className="text-[#94A3B8]">Stroop effect trainer</p>
            </div>
            <div className="w-12 h-12 bg-[#0B0E14] border border-white/5 rounded-xl flex items-center justify-center text-[#3B82F6] shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            {/* Interval Speed */}
            <div className="bg-[#0B0E14] border border-white/5 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-[#94A3B8] text-sm uppercase tracking-wider">Speed</label>
                <span className="font-mono text-[#F1F5F9] font-bold">{intervalMs}ms</span>
              </div>
              <input
                type="range"
                min="250"
                max="5000"
                step="250"
                value={intervalMs}
                onChange={(e) => setIntervalMs(parseInt(e.target.value))}
                className="w-full h-2 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
              />
            </div>

            {/* Step Limit */}
            <div className="bg-[#0B0E14] border border-white/5 p-4 rounded-xl">
              <label className="block font-bold text-[#94A3B8] text-sm uppercase tracking-wider mb-2">Amount of Changes</label>
              <input
                type="number"
                value={limitSteps}
                onChange={(e) => setLimitSteps(e.target.value)}
                placeholder="Infinite (leave empty)"
                className="w-full px-3 py-2 rounded-lg bg-[#151A23] border border-white/10 focus:border-[#3B82F6] outline-none text-[#F1F5F9] text-sm transition-colors placeholder:text-gray-600"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 gap-3">
              <div
                className="flex items-center justify-between p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors"
                onClick={() => setNoColors(!noColors)}
              >
                <div>
                  <div className="font-semibold text-[#F1F5F9]">No Colors</div>
                  <div className="text-xs text-[#94A3B8]">Text only mode</div>
                </div>
                <button className={`w-12 h-7 rounded-full transition-colors relative ${noColors ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${noColors ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              <div
                className="flex items-center justify-between p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors"
                onClick={() => setPreventDuplicateWords(!preventDuplicateWords)}
              >
                <div>
                  <div className="font-semibold text-[#F1F5F9]">No Duplicates</div>
                  <div className="text-xs text-[#94A3B8]">Unique sequence</div>
                </div>
                <button className={`w-12 h-7 rounded-full transition-colors relative ${preventDuplicateWords ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${preventDuplicateWords ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              <div
                className="flex items-center justify-between p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors"
                onClick={() => setPlaySound(!playSound)}
              >
                <div>
                  <div className="font-semibold text-[#F1F5F9]">Sound</div>
                  <div className="text-xs text-[#94A3B8]">Beep on change</div>
                </div>
                <button className={`w-12 h-7 rounded-full transition-colors relative ${playSound ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${playSound ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            {/* Custom Words */}
            <div className="bg-[#0B0E14] border border-white/5 p-4 rounded-xl">
              <label className="block font-bold text-[#94A3B8] text-sm uppercase tracking-wider mb-3">Custom Words</label>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {customLabels.map((label, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={label}
                      onChange={(e) => updateLabel(index, e.target.value)}
                      placeholder="Add word..."
                      className="flex-1 px-3 py-2 rounded-lg bg-[#151A23] border border-white/10 focus:border-[#3B82F6] outline-none text-[#F1F5F9] text-sm transition-colors"
                    />
                    {index < customLabels.length - 1 && (
                      <button onClick={() => removeLabel(index)} className="p-2 text-[#94A3B8] hover:text-red-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full mt-8 bg-[#3B82F6] text-white py-4 rounded-xl text-lg font-bold shadow-lg hover-spring transition-all hover:bg-[#2563EB]"
          >
            Start Training
          </button>
        </div>
      </div>
    )
  }

  // Playing Mode
  return (
    <div className={`fixed inset-0 z-50 flex flex-col h-full transition-colors duration-300 animate-enter ${displayConfig.bgClass}`}>
      {/* Controls */}
      <div className="absolute top-6 right-6 z-10 flex gap-4">
        <button
          onClick={stopGame}
          className="group flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white font-medium transition-all hover:pr-6 border border-white/10"
        >
          <div className="w-2 h-2 rounded-full bg-red-400 group-hover:animate-pulse"></div>
          Stop
        </button>
      </div>

      {/* Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className={`text-6xl md:text-9xl font-black tracking-tighter uppercase select-none transition-colors duration-300 text-center ${displayConfig.textClass}`}>
          {currentLabel}
        </h1>
      </div>
    </div>
  )
}
