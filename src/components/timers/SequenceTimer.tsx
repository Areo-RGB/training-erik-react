import { useState, useEffect } from 'react'
import { useAudio } from '../../hooks/useAudio'

interface TimerStep {
  id: number
  duration: number
}

interface Sequence {
  id: string
  name: string
  steps: TimerStep[]
  loop: boolean
  loopCount: number
}

interface SequenceTimerProps {
  sequence: Sequence
  onDelete: (id: string) => void
}

export default function SequenceTimer({ sequence, onDelete }: SequenceTimerProps) {
  const { playBeep, resumeAudioContext } = useAudio()
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentLoop, setCurrentLoop] = useState(1)
  const [timeLeft, setTimeLeft] = useState(sequence.steps[0]?.duration || 0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const getBtnClass = () => {
    if (isRunning) return 'bg-red-500 hover:bg-red-600'
    if (isFinished) return 'bg-[#64748B]'
    return 'bg-emerald-600 hover:bg-emerald-500'
  }

  const getBtnText = () => {
    if (isRunning) return 'Stop'
    if (isFinished) return 'Done'
    return 'Start'
  }

  const reset = () => {
    setIsRunning(false)
    setIsFinished(false)
    setCurrentStepIndex(0)
    setCurrentLoop(1)
    setTimeLeft(sequence.steps[0]?.duration || 0)
  }

  const toggle = async () => {
    if (isFinished) {
      reset()
      return
    }
    if (!isRunning) await resumeAudioContext()
    setIsRunning(prev => !prev)
  }

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          playBeep(800, 0.3)
          
          // Next step
          if (currentStepIndex < sequence.steps.length - 1) {
            const nextIndex = currentStepIndex + 1
            setCurrentStepIndex(nextIndex)
            return sequence.steps[nextIndex].duration
          }
          
          // Loop
          if (sequence.loop) {
            const max = sequence.loopCount || 0
            if (max === 0 || currentLoop < max) {
              setCurrentStepIndex(0)
              setCurrentLoop(l => l + 1)
              return sequence.steps[0].duration
            }
          }

          // Finish
          setIsRunning(false)
          setIsFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, currentStepIndex, currentLoop, sequence, playBeep])

  return (
    <div className="relative bg-[#151A23] border border-white/5 rounded-2xl overflow-hidden flex flex-col items-center justify-between min-h-[420px] pb-8 shadow-xl">
      <div className="absolute top-0 w-full h-1 opacity-80 bg-emerald-600"></div>
      
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <button
          onClick={() => onDelete(sequence.id)}
          className="p-2 text-[#94A3B8] hover:text-red-400 transition-colors"
          title="Delete Sequence"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <div className="pt-10 text-center">
        <div className="inline-flex p-4 rounded-full bg-[#0B0E14] mb-4 text-emerald-500 border border-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#F1F5F9]">{sequence.name}</h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-8">
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <div className="bg-[#0B0E14] px-4 py-1 rounded-full text-sm font-medium text-[#94A3B8] border border-white/5">
            {isFinished ? 'Completed' : `Step ${currentStepIndex + 1}/${sequence.steps.length}`}
          </div>
          {sequence.loop && (
            <div className="bg-[#0B0E14] px-4 py-1 rounded-full text-sm font-medium text-[#94A3B8] border border-white/5 flex items-center gap-1.5">
              <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
              <span>{sequence.loopCount ? `${currentLoop}/${sequence.loopCount}` : `${currentLoop}/∞`}</span>
            </div>
          )}
        </div>

        <div className="text-[4rem] font-bold font-mono tabular-nums text-[#F1F5F9] leading-none my-auto">
          {timeLeft}s
        </div>

        <div className="h-8 mb-4 text-sm text-[#94A3B8]">
          {!isFinished && (
            currentStepIndex < sequence.steps.length - 1 ? (
              <span>Next: {sequence.steps[currentStepIndex + 1].duration}s</span>
            ) : sequence.loop && (sequence.loopCount === 0 || currentLoop < sequence.loopCount) ? (
              <span>Next: {sequence.steps[0].duration}s (Loop)</span>
            ) : null
          )}
        </div>

        <div className="flex gap-4 w-full mt-auto pt-6">
          <button
            onClick={toggle}
            className={`flex-1 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${getBtnClass()}`}
          >
            {getBtnText()}
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
