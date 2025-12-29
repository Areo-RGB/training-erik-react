import { useState } from 'react'

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

interface SequenceBuilderProps {
  onClose: () => void
  onSave: (sequence: Sequence) => void
}

export default function SequenceBuilder({ onClose, onSave }: SequenceBuilderProps) {
  const [name, setName] = useState('')
  const [currentDuration, setCurrentDuration] = useState(30)
  const [steps, setSteps] = useState<TimerStep[]>([])
  const [loop, setLoop] = useState(false)
  const [loopCount, setLoopCount] = useState('')

  const adjustDuration = (delta: number) => {
    setCurrentDuration(prev => Math.max(5, prev + delta))
  }

  const addStep = () => {
    setSteps(prev => [...prev, { id: Date.now() + Math.random(), duration: currentDuration }])
  }

  const removeStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = () => {
    if (!name || steps.length === 0) return
    onSave({
      id: Date.now().toString(),
      name,
      steps,
      loop,
      loopCount: loop && loopCount ? parseInt(loopCount, 10) : 0
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-enter">
      <div className="w-full max-w-lg bg-[#1E2532] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10 animate-enter-scale">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#2A3441]/50">
          <h2 className="text-xl font-bold text-[#F1F5F9]">Create Sequence</h2>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#94A3B8] mb-2">Sequence Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HIIT Workout"
              className="w-full p-3 rounded-xl bg-[#151A23] border border-white/10 focus:border-[#3B82F6] outline-none transition-all text-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#94A3B8] mb-2">Add Timer Step</label>
            <div className="flex gap-4 items-center bg-[#151A23] p-3 rounded-xl border border-white/5">
              <button
                onClick={() => adjustDuration(-5)}
                className="w-10 h-10 rounded-lg bg-[#2A3441] hover:bg-[#334155] font-bold text-xl text-white"
              >
                -
              </button>
              <div className="flex-1 text-center font-mono text-2xl font-bold text-white">{currentDuration}s</div>
              <button
                onClick={() => adjustDuration(5)}
                className="w-10 h-10 rounded-lg bg-[#2A3441] hover:bg-[#334155] font-bold text-xl text-white"
              >
                +
              </button>
              <button
                onClick={addStep}
                className="bg-[#3B82F6] text-white p-3 rounded-lg hover:bg-[#2563EB] transition-colors flex items-center gap-2"
              >
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="mb-6 bg-[#151A23] p-4 rounded-xl flex flex-col gap-4 border border-white/5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setLoop(prev => !prev)}
            >
              <span className="font-semibold text-[#94A3B8]">Loop Sequence</span>
              <button className={`w-12 h-7 rounded-full transition-colors relative ${loop ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${loop ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>
            {loop && (
              <div className="animate-enter border-t border-white/5 pt-4">
                <label className="block text-sm font-semibold text-[#94A3B8] mb-2">Loop Count (empty = infinite)</label>
                <input
                  type="number"
                  value={loopCount}
                  onChange={(e) => setLoopCount(e.target.value)}
                  placeholder="∞"
                  className="w-full p-3 rounded-xl bg-[#2A3441] border border-white/10 focus:border-[#3B82F6] outline-none text-white"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#94A3B8]">Sequence Steps ({steps.length})</label>
            {steps.length === 0 ? (
              <div className="text-center py-8 text-[#94A3B8] bg-[#151A23]/50 rounded-xl border-2 border-dashed border-white/10">
                No steps added yet
              </div>
            ) : (
              steps.map((step, i) => (
                <div key={step.id} className="flex items-center justify-between p-3 bg-[#151A23] border border-white/5 rounded-xl animate-enter">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#2A3441] flex items-center justify-center text-xs font-bold text-[#94A3B8]">{i + 1}</span>
                    <span className="font-mono font-bold text-lg text-white">{step.duration}s</span>
                  </div>
                  <button onClick={() => removeStep(i)} className="text-[#94A3B8] hover:text-red-400 p-2">Delete</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-[#2A3441]/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-medium text-[#94A3B8] hover:bg-[#334155]">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!name || steps.length === 0}
            className="px-6 py-3 rounded-xl font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 disabled:bg-gray-500"
          >
            Save Sequence
          </button>
        </div>
      </div>
    </div>
  )
}
