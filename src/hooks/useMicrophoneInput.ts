import { useState, useEffect, useRef, useCallback } from 'react'

export interface UseMicrophoneInputOptions {
  /** Initial audio input device ID (default: 'default') */
  initialDeviceId?: string
  /** Threshold level (0-100) for triggering (default: 50) */
  threshold?: number
  /** Cooldown in ms between triggers (default: 500) */
  cooldown?: number
  /** Called when sound level exceeds threshold (respecting cooldown) */
  onTrigger?: () => void
  /** Auto-start listening on mount (default: false) */
  autoStart?: boolean
}

export interface UseMicrophoneInputReturn {
  /** Current audio level (0-100) */
  level: number
  /** Whether a trigger just occurred (resets after 150ms) */
  isTriggered: boolean
  /** Available audio input devices */
  devices: MediaDeviceInfo[]
  /** Currently selected device ID */
  selectedDeviceId: string
  /** Error message if mic access failed */
  error: string
  /** Whether mic is actively listening */
  isListening: boolean
  /** Whether device is switching */
  isLoading: boolean
  /** Start listening to microphone */
  start: () => Promise<void>
  /** Stop listening and release resources */
  stop: () => void
  /** Switch to a different audio device */
  selectDevice: (deviceId: string) => Promise<void>
  /** Update threshold dynamically */
  setThreshold: (value: number) => void
  /** Update cooldown dynamically */
  setCooldown: (value: number) => void
}

export function useMicrophoneInput(options: UseMicrophoneInputOptions = {}): UseMicrophoneInputReturn {
  const {
    initialDeviceId = 'default',
    threshold: propThreshold = 50,
    cooldown: propCooldown = 500,
    onTrigger,
    autoStart = false,
  } = options

  // State
  const [level, setLevel] = useState(0)
  const [isTriggered, setIsTriggered] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState(initialDeviceId)
  const [error, setError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Refs for audio resources
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameIdRef = useRef<number>(0)
  const lastTriggerTimeRef = useRef(0)

  // Refs for callback values (to avoid stale closures in animation loop)
  const thresholdRef = useRef(propThreshold)
  const cooldownRef = useRef(propCooldown)
  const onTriggerRef = useRef(onTrigger)
  const isListeningRef = useRef(isListening)

  // Sync refs with props (reactive to prop changes)
  useEffect(() => {
    thresholdRef.current = propThreshold
  }, [propThreshold])

  useEffect(() => {
    cooldownRef.current = propCooldown
  }, [propCooldown])

  useEffect(() => {
    onTriggerRef.current = onTrigger
  }, [onTrigger])

  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  // Load available devices
  const loadDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = deviceList.filter(d => d.kind === 'audioinput')
      setDevices(audioInputs)

      // Validate selected device still exists
      if (selectedDeviceId !== 'default') {
        const exists = audioInputs.find(d => d.deviceId === selectedDeviceId)
        if (!exists && audioInputs.length > 0) {
          setSelectedDeviceId('default')
        }
      }
    } catch (e) {
      console.error('Error enumerating devices:', e)
    }
  }, [selectedDeviceId])

  // Audio analysis loop
  const runAnalysisLoop = useCallback(() => {
    if (!analyserRef.current) return

    const loop = () => {
      if (!analyserRef.current) return

      const data = new Uint8Array(analyserRef.current.fftSize)
      analyserRef.current.getByteTimeDomainData(data)

      // Calculate RMS level
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / data.length)
      const currentLevel = Math.min(100, rms * 400)

      setLevel(currentLevel)

      // Check threshold if listening
      if (isListeningRef.current) {
        const now = Date.now()
        if (
          currentLevel > thresholdRef.current &&
          now - lastTriggerTimeRef.current > cooldownRef.current
        ) {
          lastTriggerTimeRef.current = now
          setIsTriggered(true)
          onTriggerRef.current?.()
          setTimeout(() => setIsTriggered(false), 150)
        }
      }

      frameIdRef.current = requestAnimationFrame(loop)
    }

    frameIdRef.current = requestAnimationFrame(loop)
  }, [])

  // Initialize audio stream and context
  const initAudio = useCallback(async (deviceId: string) => {
    try {
      const constraints = {
        audio: deviceId && deviceId !== 'default'
          ? { deviceId: { exact: deviceId } }
          : true
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Create audio context and analyser
      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx

      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.5
      analyserRef.current = analyser

      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)

      // Load devices after permission granted
      await loadDevices()

      return true
    } catch (e) {
      console.error('Microphone access error:', e)
      return false
    }
  }, [loadDevices])

  // Stop all audio resources
  const stop = useCallback(() => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current)
      frameIdRef.current = 0
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    setLevel(0)
    setIsListening(false)
  }, [])

  // Start listening
  const start = useCallback(async () => {
    stop() // Clean up any existing resources
    setError('')
    setIsLoading(true)

    const success = await initAudio(selectedDeviceId)
    
    if (success) {
      setIsListening(true)
      runAnalysisLoop()
    } else {
      setError('Mikrofonzugriff verweigert.')
    }

    setIsLoading(false)
  }, [selectedDeviceId, initAudio, stop, runAnalysisLoop])

  // Switch device
  const selectDevice = useCallback(async (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    
    if (isListening) {
      setIsLoading(true)
      stop()
      
      const success = await initAudio(deviceId)
      
      if (success) {
        setIsListening(true)
        runAnalysisLoop()
      } else {
        setError('Mikrofon konnte nicht gewechselt werden.')
      }
      
      setIsLoading(false)
    }
  }, [isListening, stop, initAudio, runAnalysisLoop])

  // Track if mount initialization has run
  const hasInitializedRef = useRef(false)

  // Auto-start if requested (mount-only)
  useEffect(() => {
    if (autoStart && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      start()
    }
    return () => stop()
  }, [autoStart, start, stop])

  // Listen for device changes
  useEffect(() => {
    if (isListening) {
      navigator.mediaDevices.addEventListener('devicechange', loadDevices)
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', loadDevices)
      }
    }
  }, [isListening, loadDevices])

  // Stable setters for manual threshold/cooldown updates (backwards compatibility)
  const setThreshold = useCallback((value: number) => {
    thresholdRef.current = value
  }, [])

  const setCooldown = useCallback((value: number) => {
    cooldownRef.current = value
  }, [])

  return {
    level,
    isTriggered,
    devices,
    selectedDeviceId,
    error,
    isListening,
    isLoading,
    start,
    stop,
    selectDevice,
    setThreshold,
    setCooldown,
  }
}
