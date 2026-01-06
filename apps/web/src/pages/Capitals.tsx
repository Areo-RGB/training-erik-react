import { useState, useEffect, useRef } from 'react'
import { useAudio } from '../hooks/useAudio'
import { useLocalStorageNumber } from '../hooks/useLocalStorage'
import { FontSizeControls, GameControlButtons, SliderControl } from '../components/ui'
import { CAPITALS, FONT_SIZE } from '../constants'
import { EUROPE_CAPITALS, shuffleArray } from '@training-erik/shared'

export default function Capitals() {
  const { playBeep, resumeAudioContext } = useAudio()

  const [speed, setSpeed] = useLocalStorageNumber('capitals_speed', CAPITALS.DEFAULT_SPEED)
  const [steps, setSteps] = useLocalStorageNumber('capitals_steps', CAPITALS.DEFAULT_STEPS)
  const [fontSize, setFontSize] = useLocalStorageNumber('capitals_fontSize', FONT_SIZE.CAPITALS)

  const [status, setStatus] = useState<'config' | 'playing' | 'finished'>('config')
  const [viewMode, setViewMode] = useState<'normal' | 'fullscreen'>('normal')
  const [currentStep, setCurrentStep] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState({ country: '', capital: '' })

  const shuffledDataRef = useRef<{ country: string; capital: string }[]>([])
  const timerRef = useRef<number | null>(null)
  const answerTimeoutRef = useRef<number | null>(null)

  const adjustFontSize = (delta: number) => setFontSize(Math.max(FONT_SIZE.MIN, fontSize + delta))

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (answerTimeoutRef.current) clearTimeout(answerTimeoutRef.current)
  }

  const runCurrentStep = (stepIndex: number, gameSteps: number, gameSpeed: number) => {
    if (stepIndex >= gameSteps) {
      finishGame()
      return
    }

    clearTimers()
    setProgress((stepIndex / gameSteps) * 100)
    setCurrentQuestion(shuffledDataRef.current[stepIndex])
    setShowAnswer(false)

    answerTimeoutRef.current = window.setTimeout(() => {
      setShowAnswer(true)
      playBeep(800, 0.1, 0.1)
    }, (gameSpeed * 1000) / 2)

    timerRef.current = window.setTimeout(() => {
      const nextStep = stepIndex + 1
      setCurrentStep(nextStep)
      runCurrentStep(nextStep, gameSteps, gameSpeed)
    }, gameSpeed * 1000)
  }

  const startGame = async () => {
    await resumeAudioContext()
    shuffledDataRef.current = shuffleArray(EUROPE_CAPITALS)
    setCurrentStep(0)
    setStatus('playing')
    setViewMode('normal')
    runCurrentStep(0, steps, speed)
  }

  const stopGame = () => {
    clearTimers()
    setStatus('config')
    setViewMode('normal')
  }

  const finishGame = () => {
    clearTimers()
    setProgress(100)
    setStatus('finished')
    playBeep(1200, 0.2, 0.2)
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  // Config Mode
  if (status === 'config') {
    return (
      <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center relative">
        <div className="w-full max-w-md lg:max-w-xl bg-[#151A23] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xl border border-white/5 text-center transition-all animate-enter">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#0B0E14] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-[#3B82F6] border border-white/5 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className="sm:w-[32px] sm:h-[32px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] mb-2">Hauptstädte Quiz</h1>
          <p className="text-sm sm:text-base text-[#94A3B8] mb-6 sm:mb-8">Teste dein Wissen über die europäischen Hauptstädte.</p>

          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8 text-left">
            <SliderControl
              label="Geschwindigkeit"
              value={speed}
              onChange={setSpeed}
              min={1}
              max={10}
              unit="s"
            />
            <SliderControl
              label="Anzahl"
              value={steps}
              onChange={setSteps}
              min={5}
              max={45}
              step={5}
            />
          </div>

          <button
            onClick={startGame}
            className="w-full py-3 sm:py-4 rounded-xl bg-[#3B82F6] text-white font-bold hover:bg-[#2563EB] hover-spring shadow-lg transition-colors touch-manipulation"
          >
            Quiz Starten
          </button>
        </div>
      </div>
    )
  }

  // Finished Mode
  if (status === 'finished') {
    return (
      <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center relative fixed inset-0 z-40 bg-[#0B0E14] px-4">
        <div className="w-full max-w-md flex flex-col items-center justify-center text-center animate-enter-scale">
          <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6">🎉</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9]">Quiz Beendet!</h2>
          <p className="text-sm sm:text-base text-[#94A3B8] mt-2 mb-6 sm:mb-8 px-4">Gut gemacht! Du hast alle {steps} Schritte abgeschlossen.</p>

          <GameControlButtons
            onSettings={stopGame}
            onRestart={startGame}
            variant="stacked"
          />
        </div>
      </div>
    )
  }

  // Playing Mode (Normal View)
  if (viewMode === 'normal') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 text-center animate-enter fixed inset-0 z-40 bg-[#0B0E14]">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#2A3441]">
          <div className="h-1 bg-[#3B82F6] transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Controls */}
        <div className="absolute top-16 right-2 sm:top-6 sm:right-6 flex gap-1 sm:gap-2">
          <FontSizeControls
            onDecrease={() => adjustFontSize(-1)}
            onIncrease={() => adjustFontSize(1)}
            size="sm"
          />
          <button onClick={() => setViewMode('fullscreen')} className="p-2 sm:p-3 bg-[#151A23]/80 backdrop-blur-sm rounded-full text-[#94A3B8] hover:text-white transition-colors border border-white/10 touch-manipulation" aria-label="Vollbild">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="sm:w-[20px] sm:h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
          <button onClick={stopGame} className="p-2 sm:p-3 bg-[#151A23]/80 backdrop-blur-sm rounded-full text-[#94A3B8] hover:text-white transition-colors border border-white/10 touch-manipulation" aria-label="Stopp">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="sm:w-[20px] sm:h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl px-2">
          {/* Question section */}
          <div className="h-[25vh] sm:h-[35vh] md:h-[280px] flex flex-col items-center justify-center">
            <h2
              style={{ fontSize: `clamp(1.5rem, ${Math.min(fontSize, 8)}vw, ${fontSize}rem)` }}
              className="font-black text-center text-[#F1F5F9] leading-tight px-2"
            >
              {currentQuestion.country}
            </h2>
          </div>

          {/* Answer section */}
          <div className="h-[15vh] sm:h-[20vh] md:h-[150px] flex flex-col items-center justify-center">
            <h3
              style={{ fontSize: `clamp(1rem, ${Math.min(fontSize * 0.75, 6)}vw, ${fontSize * 0.75}rem)` }}
              className={`font-bold text-[#10B981] transition-all duration-200 ${showAnswer ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
              {currentQuestion.capital}
            </h3>
          </div>
        </div>

        <div className="text-base sm:text-lg font-bold text-[#64748B] tabular-nums pb-safe">
          {currentStep + 1} / {steps}
        </div>
      </div>
    )
  }

  // Fullscreen View
  return (
    <div className="fixed inset-0 z-50 bg-[#0B0E14] flex flex-col items-center justify-center animate-enter p-2 sm:p-4">
      {/* Top Controls */}
      <div className="absolute top-16 right-2 sm:top-6 sm:right-6 flex gap-1 sm:gap-2">
        <FontSizeControls
          onDecrease={() => adjustFontSize(-1)}
          onIncrease={() => adjustFontSize(1)}
        />
        {/* Exit Fullscreen Button */}
        <button onClick={() => setViewMode('normal')} className="p-3 sm:p-4 bg-[#151A23] rounded-full text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#2A3441] transition-all shadow-sm border border-white/5 touch-manipulation">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="sm:w-[24px] sm:h-[24px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center text-center w-full px-2">
        {/* Question section */}
        <div className="h-[35vh] sm:h-[40vh] flex flex-col items-center justify-center">
          <h2
            style={{ fontSize: `clamp(2rem, ${Math.min(fontSize * 2, 12)}vw, ${fontSize * 2.5}rem)` }}
            className="font-black text-[#F1F5F9] leading-none"
          >
            {currentQuestion.country}
          </h2>
        </div>

        {/* Answer section */}
        <div className="h-[25vh] sm:h-[30vh] flex flex-col items-center justify-center">
          <h3
            style={{ fontSize: `clamp(1.5rem, ${Math.min(fontSize * 1.5, 9)}vw, ${fontSize * 2}rem)` }}
            className={`font-bold text-[#10B981] leading-none transition-all duration-200 ${showAnswer ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            {currentQuestion.capital}
          </h3>
        </div>
      </div>
    </div>
  )
}
