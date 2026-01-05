import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useAudio } from './useAudio'

// Mock implementations
const mockStop = vi.fn()
const mockDisconnect = vi.fn()
const mockStart = vi.fn()
const mockConnect = vi.fn()

const createMockOscillator = () => ({
  connect: mockConnect,
  disconnect: mockDisconnect,
  start: mockStart,
  stop: mockStop,
  frequency: { value: 0 },
  onended: null as (() => void) | null,
})

const createMockGainNode = () => ({
  connect: mockConnect,
  gain: { value: 0 },
})

const mockResume = vi.fn().mockResolvedValue(undefined)
let mockState = 'running'
let audioContextCallCount = 0

class MockAudioContext {
  state = mockState
  currentTime = 0
  destination = {}
  resume = mockResume
  createOscillator = vi.fn().mockImplementation(createMockOscillator)
  createGain = vi.fn().mockImplementation(createMockGainNode)

  constructor() {
    audioContextCallCount++
  }
}

describe('useAudio', () => {
  const originalAudioContext = window.AudioContext

  beforeEach(() => {
    vi.clearAllMocks()
    mockState = 'running'
    audioContextCallCount = 0
    // @ts-expect-error - mocking global
    window.AudioContext = MockAudioContext
  })

  afterEach(() => {
    window.AudioContext = originalAudioContext
  })

  it('should return playBeep, stopBeep, and resumeAudioContext functions', () => {
    const { result } = renderHook(() => useAudio())

    expect(typeof result.current.playBeep).toBe('function')
    expect(typeof result.current.stopBeep).toBe('function')
    expect(typeof result.current.resumeAudioContext).toBe('function')
  })

  it('should create AudioContext on first playBeep call', () => {
    const { result } = renderHook(() => useAudio())

    act(() => {
      result.current.playBeep()
    })

    expect(audioContextCallCount).toBe(1)
  })

  it('should reuse AudioContext on subsequent playBeep calls', () => {
    const { result } = renderHook(() => useAudio())

    act(() => {
      result.current.playBeep()
      result.current.playBeep()
      result.current.playBeep()
    })

    expect(audioContextCallCount).toBe(1)
  })

  it('should use default parameters when calling playBeep', () => {
    const { result } = renderHook(() => useAudio())

    act(() => {
      result.current.playBeep()
    })

    expect(mockStart).toHaveBeenCalled()
    expect(mockStop).toHaveBeenCalled()
    expect(mockConnect).toHaveBeenCalled()
  })

  it('should accept custom frequency, duration, and volume', () => {
    const { result } = renderHook(() => useAudio())

    act(() => {
      result.current.playBeep(440, 0.5, 0.5)
    })

    expect(mockStart).toHaveBeenCalled()
  })

  it('should stop current oscillator when stopBeep is called', () => {
    const { result } = renderHook(() => useAudio())

    act(() => {
      result.current.playBeep()
    })

    vi.clearAllMocks()

    act(() => {
      result.current.stopBeep()
    })

    expect(mockStop).toHaveBeenCalled()
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('should not throw when stopBeep is called with no active oscillator', () => {
    const { result } = renderHook(() => useAudio())

    expect(() => {
      act(() => {
        result.current.stopBeep()
      })
    }).not.toThrow()
  })

  it('should stop previous oscillator when playing a new beep', () => {
    const { result } = renderHook(() => useAudio())

    act(() => {
      result.current.playBeep()
    })

    vi.clearAllMocks()

    act(() => {
      result.current.playBeep()
    })

    // Previous oscillator should be stopped
    expect(mockStop).toHaveBeenCalled()
  })

  it('should resume suspended AudioContext', async () => {
    mockState = 'suspended'

    // Create a new mock class with suspended state
    class SuspendedAudioContext {
      state = 'suspended'
      currentTime = 0
      destination = {}
      resume = mockResume
      createOscillator = vi.fn().mockImplementation(createMockOscillator)
      createGain = vi.fn().mockImplementation(createMockGainNode)
    }
    // @ts-expect-error - mocking global
    window.AudioContext = SuspendedAudioContext

    const { result } = renderHook(() => useAudio())

    // Initialize context first
    act(() => {
      result.current.playBeep()
    })

    await act(async () => {
      await result.current.resumeAudioContext()
    })

    expect(mockResume).toHaveBeenCalled()
  })

  it('should not resume already running AudioContext', async () => {
    const { result } = renderHook(() => useAudio())

    // Initialize context first
    act(() => {
      result.current.playBeep()
    })

    vi.clearAllMocks()

    await act(async () => {
      await result.current.resumeAudioContext()
    })

    expect(mockResume).not.toHaveBeenCalled()
  })

  it('should handle AudioContext not being supported', () => {
    // @ts-expect-error - removing global
    delete window.AudioContext
    // Remove webkit fallback
    const win = window as unknown as { webkitAudioContext?: unknown }
    delete win.webkitAudioContext

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useAudio())

    act(() => {
      result.current.playBeep()
    })

    expect(consoleSpy).toHaveBeenCalledWith('AudioContext not supported')
    consoleSpy.mockRestore()
  })
})
