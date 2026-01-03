import { useState, useEffect, useRef } from 'react'
import { useAudio } from '../hooks/useAudio'
import { useLocalStorageNumber } from '../hooks/useLocalStorage'

export default function Intervall() {
  const { playBeep, resumeAudioContext } = useAudio()
  
  const [intervalSec, setIntervalSec] = useState(2)
  const [limitSec, setLimitSec] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [volumeBoost, setVolumeBoost] = useLocalStorageNumber('intervall_volumeBoost', 0)
  
  const timerRef = useRef<number | null>(null)
  const limitTimerRef = useRef<number | null>(null)

  const adjustInterval = (amount: number) => {
    setIntervalSec(prev => Math.max(0.1, parseFloat((prev + amount).toFixed(1))))
  }

  const play = () => {
    const vol = volumeBoost ? 0.8 : 0.15
    playBeep(600, 0.15, vol)
  }

  const start = async () => {
    await resumeAudioContext()
    setIsRunning(true)
    play()

    timerRef.current = window.setInterval(() => play(), intervalSec * 1000)

    const limit = parseInt(limitSec || '0', 10)
    if (limit > 0) {
      limitTimerRef.current = window.setTimeout(() => {
        stop()
      }, limit * 1000)
    }
  }

  const stop = () => {
    setIsRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (limitTimerRef.current) clearTimeout(limitTimerRef.current)
  }

  const toggle = () => {
    if (isRunning) stop()
    else start()
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (limitTimerRef.current) clearTimeout(limitTimerRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-enter">
      <div className="w-full max-w-md lg:max-w-xl bg-[#151A23] rounded-3xl p-8 lg:p-10 shadow-xl border border-white/5 text-center transition-all">
        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#0B0E14] rounded-full flex items-center justify-center mx-auto mb-6 text-[#3B82F6] border border-white/5 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="lg:w-12 lg:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20" />
            <path d="M2 12h20" />
            <path d="M12 2a10 10 0 0 1 10 10" />
            <path d="M2 12a10 10 0 0 1 10-10" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Intervall</h1>
        <p className="text-[#94A3B8] mb-8">Periodic audio cues for training.</p>

        <div className="space-y-6 mb-8 text-left">
          <div>
            <label className="block text-sm font-bold text-[#94A3B8] mb-4 uppercase tracking-wider text-center">
              Interval (Seconds)
            </label>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => adjustInterval(-0.5)}
                className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-xl bg-[#0B0E14] border border-white/10 hover:bg-[#2A3441] font-bold text-xl transition-colors btn-press text-[#F1F5F9]"
              >
                -
              </button>
              <input
                type="number"
                value={intervalSec}
                onChange={(e) => setIntervalSec(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="w-32 lg:w-40 text-center text-3xl lg:text-4xl font-black bg-transparent border-b-2 border-[#2A3441] focus:border-[#3B82F6] outline-none py-2 text-[#F1F5F9]"
              />
              <button
                onClick={() => adjustInterval(0.5)}
                className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-xl bg-[#0B0E14] border border-white/10 hover:bg-[#2A3441] font-bold text-xl transition-colors btn-press text-[#F1F5F9]"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">
              Auto-Stop Limit (Optional)
            </label>
            <input
              type="number"
              value={limitSec}
              onChange={(e) => setLimitSec(e.target.value)}
              placeholder="Seconds (e.g. 60)"
              className="w-full p-4 rounded-xl bg-[#0B0E14] border border-white/10 focus:border-[#3B82F6] outline-none font-bold text-[#F1F5F9] transition-all placeholder:font-normal placeholder:text-gray-600"
            />
          </div>

          <div
            className="flex items-center justify-between p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors btn-press"
            onClick={() => setVolumeBoost(volumeBoost ? 0 : 1)}
          >
            <span className="font-semibold text-[#F1F5F9]">Volume Boost</span>
            <div className={`w-12 h-7 rounded-full transition-colors relative ${volumeBoost ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${volumeBoost ? 'left-6' : 'left-1'}`}></div>
            </div>
          </div>
        </div>

        <button
          onClick={toggle}
          className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transform transition-all hover-spring ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-[#3B82F6] hover:bg-[#2563EB]'}`}
        >
          {isRunning ? 'Stop' : 'Start Timer'}
        </button>
      </div>
    </div>
  )
}
