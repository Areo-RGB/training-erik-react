import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import TimerInstance from '../components/timers/TimerInstance'
import SequenceTimer from '../components/timers/SequenceTimer'
import SequenceBuilder from '../components/timers/SequenceBuilder'

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

export default function Timers() {
  const [sequences, setSequences] = useLocalStorage<Sequence[]>('erik_timer_sequences', [])
  const [showBuilder, setShowBuilder] = useState(false)

  const addSequence = (seq: Sequence) => {
    setSequences(prev => [...prev, seq])
    setShowBuilder(false)
  }

  const deleteSequence = (id: string) => {
    if (confirm('Delete this sequence?')) {
      setSequences(prev => prev.filter(s => s.id !== id))
    }
  }

  return (
    <div className="animate-enter">
      <div className="flex flex-col items-center mb-12 relative">
        <h1 className="text-3xl font-bold text-center text-[#F1F5F9]">Timers</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Standard Timers */}
        <div className="animate-enter opacity-0" style={{ animationDelay: '0ms' }}>
          <TimerInstance title="Custom Timer" color="blue" defaultDuration={60} />
        </div>
        <div className="animate-enter opacity-0" style={{ animationDelay: '100ms' }}>
          <TimerInstance title="Presets" color="orange" defaultDuration={30} presets={[15, 30, 45, 60]} />
        </div>

        {/* Saved Sequences */}
        {sequences.map((seq, i) => (
          <div key={seq.id} className="animate-enter opacity-0" style={{ animationDelay: `${200 + i * 100}ms` }}>
            <SequenceTimer sequence={seq} onDelete={deleteSequence} />
          </div>
        ))}

        {/* Add Sequence Card */}
        <button
          onClick={() => setShowBuilder(true)}
          style={{ animationDelay: `${200 + sequences.length * 100}ms` }}
          className="animate-enter opacity-0 relative bg-[#151A23] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center min-h-[420px] text-[#94A3B8] hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#151A23]/50 transition-all group hover-spring"
        >
          <div className="w-16 h-16 rounded-full bg-[#0B0E14] border border-white/5 group-hover:bg-[#3B82F6]/10 flex items-center justify-center mb-4 transition-colors">
            <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold">Create Sequence</h3>
          <p className="text-sm opacity-70 mt-2">Build a custom loop of timers</p>
        </button>
      </div>

      {/* Builder Modal */}
      {showBuilder && (
        <SequenceBuilder onClose={() => setShowBuilder(false)} onSave={addSequence} />
      )}
    </div>
  )
}
