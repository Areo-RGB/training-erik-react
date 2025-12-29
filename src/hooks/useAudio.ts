import { useRef, useCallback } from 'react'

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const currentOscRef = useRef<OscillatorNode | null>(null)

  const getContext = useCallback((): AudioContext | null => {
    if (!audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
      } catch (e) {
        console.error('AudioContext not supported')
      }
    }
    return audioContextRef.current
  }, [])

  const resumeAudioContext = useCallback(async (): Promise<void> => {
    const ctx = getContext()
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume()
    }
  }, [getContext])

  const stopBeep = useCallback(() => {
    if (currentOscRef.current) {
      try {
        currentOscRef.current.stop()
        currentOscRef.current.disconnect()
      } catch {
        // ignore
      }
      currentOscRef.current = null
    }
  }, [])

  const playBeep = useCallback((freq: number = 600, duration: number = 0.15, vol: number = 0.1) => {
    const ctx = getContext()
    if (!ctx) return

    stopBeep()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.value = freq
    gain.gain.value = vol

    osc.onended = () => {
      if (currentOscRef.current === osc) {
        currentOscRef.current = null
      }
      osc.disconnect()
    }

    currentOscRef.current = osc
    osc.start()
    osc.stop(ctx.currentTime + duration)
  }, [getContext, stopBeep])

  return { playBeep, stopBeep, resumeAudioContext }
}
