import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useMicrophoneInput } from './useMicrophoneInput'

// Mock track
const mockTrackStop = vi.fn()
const createMockTrack = () => ({
  stop: mockTrackStop,
})

// Mock stream
const createMockStream = () => ({
  getTracks: () => [createMockTrack()],
})

// Mock analyser
const mockGetByteTimeDomainData = vi.fn((data: Uint8Array) => {
  // Fill with silence (128 = zero crossing)
  for (let i = 0; i < data.length; i++) {
    data[i] = 128
  }
})

const createMockAnalyser = () => ({
  fftSize: 256,
  smoothingTimeConstant: 0.5,
  getByteTimeDomainData: mockGetByteTimeDomainData,
})

// Mock source
const mockSourceConnect = vi.fn()
const createMockSource = () => ({
  connect: mockSourceConnect,
})

// Mock AudioContext
const mockClose = vi.fn().mockResolvedValue(undefined)

class MockAudioContext {
  state = 'running'
  createAnalyser = vi.fn().mockImplementation(createMockAnalyser)
  createMediaStreamSource = vi.fn().mockImplementation(createMockSource)
  close = mockClose
}

// Mock mediaDevices
const mockGetUserMedia = vi.fn().mockResolvedValue(createMockStream())
const mockEnumerateDevices = vi.fn().mockResolvedValue([
  { deviceId: 'device1', kind: 'audioinput', label: 'Microphone 1' },
  { deviceId: 'device2', kind: 'audioinput', label: 'Microphone 2' },
  { deviceId: 'videoDevice', kind: 'videoinput', label: 'Camera' },
])

const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

// Store original globals
const originalAudioContext = window.AudioContext
const originalRaf = window.requestAnimationFrame
const originalCancelRaf = window.cancelAnimationFrame

// Mock requestAnimationFrame
let rafCallback: FrameRequestCallback | null = null
const mockRaf = vi.fn((cb: FrameRequestCallback) => {
  rafCallback = cb
  return 1
})
const mockCancelRaf = vi.fn()

describe('useMicrophoneInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rafCallback = null

    // Mock navigator.mediaDevices - needs to persist during React cleanup
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: mockGetUserMedia,
        enumerateDevices: mockEnumerateDevices,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      },
      configurable: true,
      writable: true,
    })

    // @ts-expect-error - mocking global
    window.AudioContext = MockAudioContext
    window.requestAnimationFrame = mockRaf
    window.cancelAnimationFrame = mockCancelRaf
  })

  afterEach(() => {
    window.AudioContext = originalAudioContext
    window.requestAnimationFrame = originalRaf
    window.cancelAnimationFrame = originalCancelRaf
    // Note: Don't restore navigator.mediaDevices - it needs to exist for React cleanup
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useMicrophoneInput())

    expect(result.current.level).toBe(0)
    expect(result.current.isTriggered).toBe(false)
    expect(result.current.devices).toEqual([])
    expect(result.current.selectedDeviceId).toBe('default')
    expect(result.current.error).toBe('')
    expect(result.current.isListening).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('should return control functions', () => {
    const { result } = renderHook(() => useMicrophoneInput())

    expect(typeof result.current.start).toBe('function')
    expect(typeof result.current.stop).toBe('function')
    expect(typeof result.current.selectDevice).toBe('function')
    expect(typeof result.current.setThreshold).toBe('function')
    expect(typeof result.current.setCooldown).toBe('function')
  })

  it('should use initial options', () => {
    const { result } = renderHook(() =>
      useMicrophoneInput({
        initialDeviceId: 'custom-device',
        threshold: 75,
        cooldown: 1000,
      })
    )

    expect(result.current.selectedDeviceId).toBe('custom-device')
  })

  it('should request microphone permission when start() is called', async () => {
    const { result } = renderHook(() => useMicrophoneInput())

    await act(async () => {
      await result.current.start()
    })

    expect(mockGetUserMedia).toHaveBeenCalled()
  })

  it('should update isListening state after start()', async () => {
    const { result } = renderHook(() => useMicrophoneInput())

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.isListening).toBe(true)
  })

  it('should filter only audio input devices', async () => {
    const { result } = renderHook(() => useMicrophoneInput())

    await act(async () => {
      await result.current.start()
    })

    expect(mockEnumerateDevices).toHaveBeenCalled()
    expect(result.current.devices).toHaveLength(2)
    expect(result.current.devices.every((d) => d.kind === 'audioinput')).toBe(true)
  })

  it('should set error when getUserMedia fails', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'))

    const { result } = renderHook(() => useMicrophoneInput())

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.error).toBe('Mikrofonzugriff verweigert.')
    expect(result.current.isListening).toBe(false)
  })

  it('should update selectedDeviceId when selectDevice is called', async () => {
    const { result } = renderHook(() => useMicrophoneInput())

    await act(async () => {
      await result.current.selectDevice('device2')
    })

    expect(result.current.selectedDeviceId).toBe('device2')
  })

  it('should use exact deviceId constraint for non-default device', async () => {
    const { result } = renderHook(() => useMicrophoneInput())

    await act(async () => {
      await result.current.start()
    })

    vi.clearAllMocks()

    await act(async () => {
      await result.current.selectDevice('device2')
    })

    expect(mockGetUserMedia).toHaveBeenCalledWith({
      audio: { deviceId: { exact: 'device2' } },
    })
  })

  it('should not restart when selectDevice is called while not listening', async () => {
    const { result } = renderHook(() => useMicrophoneInput())

    await act(async () => {
      await result.current.selectDevice('device2')
    })

    expect(mockGetUserMedia).not.toHaveBeenCalled()
  })

  it('should allow updating threshold via setThreshold()', () => {
    const { result } = renderHook(() => useMicrophoneInput({ threshold: 50 }))

    expect(() => {
      act(() => {
        result.current.setThreshold(75)
      })
    }).not.toThrow()
  })

  it('should allow updating cooldown via setCooldown()', () => {
    const { result } = renderHook(() => useMicrophoneInput({ cooldown: 500 }))

    expect(() => {
      act(() => {
        result.current.setCooldown(1000)
      })
    }).not.toThrow()
  })

  it('should stop listening and reset level when stop() is called', async () => {
    const { result } = renderHook(() => useMicrophoneInput())

    await act(async () => {
      await result.current.start()
    })

    act(() => {
      result.current.stop()
    })

    expect(result.current.isListening).toBe(false)
    expect(result.current.level).toBe(0)
  })

  it('should stop media tracks when stop() is called', async () => {
    const { result } = renderHook(() => useMicrophoneInput())

    await act(async () => {
      await result.current.start()
    })

    act(() => {
      result.current.stop()
    })

    expect(mockTrackStop).toHaveBeenCalled()
  })

  it('should close AudioContext when stop() is called', async () => {
    const { result } = renderHook(() => useMicrophoneInput())

    await act(async () => {
      await result.current.start()
    })

    act(() => {
      result.current.stop()
    })

    expect(mockClose).toHaveBeenCalled()
  })

  it('should cancel animation frame when stop() is called', async () => {
    const { result } = renderHook(() => useMicrophoneInput())

    await act(async () => {
      await result.current.start()
    })

    act(() => {
      result.current.stop()
    })

    expect(mockCancelRaf).toHaveBeenCalled()
  })

  it('should call onTrigger when sound exceeds threshold', async () => {
    const onTrigger = vi.fn()

    // Mock loud sound (values far from 128)
    mockGetByteTimeDomainData.mockImplementation((data: Uint8Array) => {
      for (let i = 0; i < data.length; i++) {
        data[i] = 255 // Maximum amplitude
      }
    })

    const { result } = renderHook(() =>
      useMicrophoneInput({
        threshold: 10,
        cooldown: 100,
        onTrigger,
      })
    )

    await act(async () => {
      await result.current.start()
    })

    // Simulate RAF loop
    if (rafCallback) {
      act(() => {
        rafCallback!(0)
      })
    }

    expect(onTrigger).toHaveBeenCalled()
  })
})
