import { useState, useEffect, useRef } from 'react'
import { useAudio } from '../hooks/useAudio'
import { useLocalStorageNumber, useLocalStorageBoolean } from '../hooks/useLocalStorage'
import confetti from 'canvas-confetti'

export default function Kettenrechner() {
  const { playBeep, resumeAudioContext } = useAudio()
  
  const [speed, setSpeed] = useLocalStorageNumber('kettenrechner_speed', 5)
  const [targetSteps, setTargetSteps] = useLocalStorageNumber('kettenrechner_targetSteps', 5)
  const [fontSize, setFontSize] = useLocalStorageNumber('kettenrechner_fontSize', 6)
  const [playBeepOnStep, setPlayBeepOnStep] = useLocalStorageBoolean('kettenrechner_playBeepOnStep', false)
  
  const [status, setStatus] = useState<'config' | 'playing' | 'pending' | 'result'>('config')
  const [levelsOpen, setLevelsOpen] = useState(false)
  
  const [display, setDisplay] = useState('Ready?')
  const [total, setTotal] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const timerRef = useRef<number | null>(null)
  const gameAudioRef = useRef<HTMLAudioElement | null>(null)

  const adjustSpeed = (delta: number) => setSpeed(Math.max(1, Math.min(30, speed + delta)))
  const adjustTargetSteps = (delta: number) => setTargetSteps(Math.max(1, targetSteps + delta))
  const adjustFontSize = (delta: number) => setFontSize(Math.max(2, Math.min(20, fontSize + delta)))

  const stopSound = () => {
    if (gameAudioRef.current) {
      gameAudioRef.current.pause()
      gameAudioRef.current = null
    }
  }

  const playGameSound = (src: string) => {
    stopSound()
    gameAudioRef.current = new Audio(src)
    gameAudioRef.current.volume = 0.5
    gameAudioRef.current.play().catch(() => {})
  }

  const startGame = async (overrideSpeed?: number, overrideSteps?: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    
    if (overrideSpeed) setSpeed(overrideSpeed)
    if (overrideSteps) setTargetSteps(overrideSteps)
    
    await resumeAudioContext()
    setStatus('playing')
    setTotal(0)
    setHistory([])
    setCurrentStep(0)
    stopSound()
    
    runCountdown(overrideSpeed || speed, overrideSteps || targetSteps)
  }

  const runCountdown = (gameSpeed: number, gameSteps: number) => {
    const seq = ['3', '2', '1']
    let idx = 0
    setDisplay(seq[0])

    timerRef.current = window.setInterval(() => {
      idx++
      if (idx < seq.length) {
        setDisplay(seq[idx])
      } else {
        if (timerRef.current) clearInterval(timerRef.current)
        runGameLoop(gameSpeed, gameSteps)
      }
    }, 1000)
  }

  const runGameLoop = (gameSpeed: number, gameSteps: number) => {
    let currentTotal = 0
    let steps = 0
    setCurrentStep(0)

    const tick = () => {
      if (steps >= gameSteps) {
        finishGame(currentTotal)
        return
      }

      const n = Math.floor(Math.random() * 9) + 1
      let add = Math.random() > 0.5
      if (!add && currentTotal - n < 0) add = true

      currentTotal = add ? currentTotal + n : currentTotal - n
      const opStr = add ? `+${n}` : `-${n}`

      if (playBeepOnStep) {
        playBeep(600, 0.1)
      }

      setDisplay(opStr)
      setTotal(currentTotal)
      setHistory(h => [...h, opStr])
      setCurrentStep(steps + 1)
      steps++
    }

    tick()
    timerRef.current = window.setInterval(tick, gameSpeed * 1000)
  }

  const finishGame = (finalTotal: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTotal(finalTotal)
    setStatus('pending')
    setDisplay('?')
    setUserAnswer('')
    setIsCorrect(null)
    setShowCelebration(false)
  }

  const appendDigit = (digit: number) => {
    setUserAnswer(s => s + digit.toString())
  }

  const checkAnswer = () => {
    const ans = parseInt(userAnswer, 10)
    const correct = ans === total
    setIsCorrect(correct)
    setShowCelebration(correct)

    if (correct) {
      playGameSound('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg')
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6347', '#ffa500', '#32cd32', '#1e90ff', '#ff69b4', '#8BAA8B', '#5076A3'],
      })
    } else {
      playGameSound('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg')
    }
    setStatus('result')
  }

  const stopGame = () => {
    stopSound()
    if (timerRef.current) clearInterval(timerRef.current)
    setStatus('config')
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      stopSound()
    }
  }, [])

  const isCountdown = ['3', '2', '1'].includes(display)

  return (
    <div className={`w-full h-full min-h-[60vh] flex flex-col items-center justify-center relative ${status !== 'config' ? 'fixed inset-0 z-40 bg-[#0B0E14]' : ''}`}>
      {status !== 'config' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-[#3B82F6]/50 animate-enter"></div>
      )}

      <div className={`w-full max-w-2xl bg-[#151A23] rounded-3xl border border-white/5 shadow-xl flex flex-col items-center relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${status === 'config' ? 'p-12 min-h-[500px] animate-enter-scale' : 'h-full w-full max-w-none rounded-none p-12 bg-[#0B0E14] border-none'}`}>

        {/* CONFIG MODE */}
        {status === 'config' && (
          <div className="w-full flex flex-col gap-6 items-center flex-1 justify-center animate-enter">
            <div className="w-20 h-20 bg-[#0B0E14] rounded-full flex items-center justify-center text-[#3B82F6] border border-white/5 shadow-inner mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-[#F1F5F9]">Chain Calculator</h2>

            {/* Levels */}
            <div className="w-full bg-[#0B0E14] rounded-xl overflow-hidden transition-all border border-white/5">
              <button
                onClick={() => setLevelsOpen(!levelsOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#2A3441] transition-colors font-semibold text-[#F1F5F9]"
              >
                <span>Levels</span>
                <div className={`transition-transform duration-300 text-[#94A3B8] ${levelsOpen ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </button>
              
              {levelsOpen && (
                <div className="p-4 grid grid-cols-1 gap-3 border-t border-white/5 animate-enter">
                  <button onClick={() => startGame(5, 5)} className="p-3 bg-[#151A23] rounded-lg border border-white/5 hover:border-[#3B82F6] transition-all text-left group hover-spring">
                    <div className="font-bold text-[#3B82F6]">Level 1</div>
                    <div className="text-xs text-[#94A3B8]">Speed: 5s, Steps: 5</div>
                  </button>
                  <button onClick={() => startGame(5, 10)} className="p-3 bg-[#151A23] rounded-lg border border-white/5 hover:border-[#3B82F6] transition-all text-left group hover-spring">
                    <div className="font-bold text-[#3B82F6]">Level 2</div>
                    <div className="text-xs text-[#94A3B8]">Speed: 5s, Steps: 10</div>
                  </button>
                  <button onClick={() => startGame(4, 5)} className="p-3 bg-[#151A23] rounded-lg border border-white/5 hover:border-[#3B82F6] transition-all text-left group hover-spring">
                    <div className="font-bold text-[#3B82F6]">Level 3</div>
                    <div className="text-xs text-[#94A3B8]">Speed: 4s, Steps: 5</div>
                  </button>
                </div>
              )}
            </div>

            {/* Manual Config */}
            <div className="w-full bg-[#0B0E14] rounded-xl p-6 flex flex-col gap-6 border border-white/5">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Speed (Seconds)</span>
                <div className="flex items-center gap-6">
                  <button onClick={() => adjustSpeed(-1)} className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10">-</button>
                  <span className="text-2xl font-black w-16 text-center tabular-nums text-[#F1F5F9]">{speed}s</span>
                  <button onClick={() => adjustSpeed(1)} className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10">+</button>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Steps</span>
                <div className="flex items-center gap-6">
                  <button onClick={() => adjustTargetSteps(-1)} className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10">-</button>
                  <span className="text-2xl font-black w-16 text-center tabular-nums text-[#F1F5F9]">{targetSteps}</span>
                  <button onClick={() => adjustTargetSteps(1)} className="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10">+</button>
                </div>
              </div>

              <div className="w-full border-t border-white/10 pt-4 mt-2">
                <div
                  className="flex items-center justify-between w-full px-4 py-3 bg-[#151A23] rounded-lg cursor-pointer hover:bg-[#2A3441] transition-colors"
                  onClick={() => setPlayBeepOnStep(!playBeepOnStep)}
                >
                  <span className="font-semibold text-sm text-[#F1F5F9]">Beep on Step</span>
                  <button className={`w-12 h-7 rounded-full transition-colors relative ${playBeepOnStep ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${playBeepOnStep ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => startGame()}
              className="bg-[#3B82F6] text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-[#2563EB] hover-spring transition-all mt-6 w-full"
            >
              Start
            </button>
          </div>
        )}

        {/* PLAYING MODE */}
        {status === 'playing' && (
          <div className="flex-1 flex flex-col items-center justify-center w-full animate-enter">
            <div className="flex flex-col items-center">
              <div
                style={{ fontSize: `${fontSize}rem` }}
                className={`font-black tracking-tighter tabular-nums transition-all duration-200 select-none ${isCountdown ? 'text-[#3B82F6] scale-110' : 'text-[#F1F5F9]'}`}
              >
                {display}
              </div>

              {!isCountdown && (
                <div className="mt-4 text-3xl font-bold text-[#64748B] tabular-nums animate-enter delay-100">
                  {currentStep}/{targetSteps}
                </div>
              )}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 animate-enter delay-200">
              <div className="flex items-center gap-4">
                <button onClick={stopGame} className="bg-[#2A3441] text-[#94A3B8] px-6 py-4 rounded-xl text-lg font-bold shadow-sm hover:bg-[#334155] hover:text-white transition-all btn-press">
                  Stop
                </button>
                <button onClick={() => startGame()} className="bg-[#3B82F6] text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-[#2563EB] transition-all btn-press">
                  Restart
                </button>
              </div>
              
              <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                <button onClick={() => adjustFontSize(-1)} className="p-2 rounded-full bg-[#151A23] text-[#94A3B8] hover:bg-[#2A3441] btn-press">-</button>
                <button onClick={() => adjustFontSize(1)} className="p-2 rounded-full bg-[#151A23] text-[#94A3B8] hover:bg-[#2A3441] btn-press">+</button>
              </div>
            </div>
          </div>
        )}

        {/* PENDING MODE (INPUT) */}
        {status === 'pending' && (
          <div className="flex-1 flex flex-col items-center justify-center w-full animate-enter">
            <div className="flex flex-col items-center w-full max-w-xs">
              <div className="w-full bg-[#151A23] rounded-xl p-4 mb-6 text-center min-h-[4rem] flex items-center justify-center shadow-lg border border-white/5">
                <span className="text-4xl font-bold tabular-nums text-[#F1F5F9]">
                  {userAnswer || '?'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full mb-6">
                {[1,2,3,4,5,6,7,8,9].map((digit, i) => (
                  <button
                    key={digit}
                    onClick={() => appendDigit(digit)}
                    style={{ animationDelay: `${i * 30}ms` }}
                    className="animate-enter opacity-0 p-4 text-2xl font-bold bg-[#1E2532] text-[#F1F5F9] border border-white/5 rounded-xl hover:bg-[#2A3441] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    {digit}
                  </button>
                ))}
                <button onClick={() => appendDigit(0)} className="animate-enter delay-300 opacity-0 p-4 text-2xl font-bold bg-[#1E2532] text-[#F1F5F9] border border-white/5 rounded-xl hover:bg-[#2A3441] hover:-translate-y-0.5 active:translate-y-0 transition-all">0</button>
                <button onClick={() => setUserAnswer('')} className="animate-enter delay-300 opacity-0 p-4 text-xl font-bold bg-red-900/20 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all">C</button>
              </div>

              <button
                onClick={checkAnswer}
                className="w-full bg-[#10B981] text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-[#059669] hover:-translate-y-0.5 active:translate-y-0 transition-all animate-enter delay-500 opacity-0"
              >
                Enter
              </button>
            </div>
          </div>
        )}

        {/* RESULT MODE */}
        {status === 'result' && (
          <div className="flex-1 flex flex-col items-center justify-center w-full text-center animate-enter">
            {showCelebration && <div className="text-6xl mb-4 animate-celebrate">🎉</div>}
            {isCorrect === false && <div className="text-6xl mb-4 animate-enter-scale">❌</div>}

            <h2 className="text-[#94A3B8] font-bold text-sm uppercase tracking-widest mb-4 mt-4 delay-100 animate-enter opacity-0">Result</h2>
            <div
              style={{ fontSize: `${fontSize}rem` }}
              className={`font-black leading-none mb-8 tabular-nums delay-150 animate-enter opacity-0 ${showCelebration ? 'text-[#10B981]' : 'text-[#3B82F6]'}`}
            >
              {total}
            </div>
            <div className="bg-[#151A23] border border-white/5 px-6 py-3 rounded-full font-mono text-base text-[#94A3B8] delay-200 animate-enter opacity-0">
              0 {history.join(' ')} = {total}
            </div>

            <div className="mt-12 flex items-center justify-center gap-4 delay-300 animate-enter opacity-0">
              <button
                onClick={stopGame}
                className="bg-[#2A3441] text-[#94A3B8] px-6 py-4 rounded-xl text-lg font-bold shadow-sm hover:bg-[#334155] hover:text-white transition-all btn-press"
              >
                Settings
              </button>
              <button
                onClick={() => startGame()}
                className="bg-[#F1F5F9] text-[#0B0E14] px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-white hover:scale-105 transition-all btn-press"
              >
                Restart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
