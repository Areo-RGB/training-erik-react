import { useState, useEffect, useRef } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { useStorage, numberSerializer, KETTENRECHNER } from '@training-erik/shared'
import { asyncStorageAdapter } from '../hooks/asyncStorageAdapter'
import { NumberPad } from '../components/NumberPad'

const colors = {
  canvas: '#0B0E14',
  surface: '#151A23',
  primary: '#F1F5F9',
  secondary: '#94A3B8',
  action: '#3B82F6',
  success: '#10B981',
}

type Status = 'config' | 'playing' | 'pending' | 'result'

export default function Kettenrechner() {
  const [speed, setSpeed] = useStorage(
    'kettenrechner_speed',
    KETTENRECHNER.DEFAULT_SPEED,
    asyncStorageAdapter,
    numberSerializer
  )
  const [targetSteps, setTargetSteps] = useStorage(
    'kettenrechner_targetSteps',
    KETTENRECHNER.DEFAULT_STEPS,
    asyncStorageAdapter,
    numberSerializer
  )

  const [status, setStatus] = useState<Status>('config')
  const [display, setDisplay] = useState('3')
  const [total, setTotal] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  useEffect(() => () => clearTimer(), [])

  const startGame = () => {
    clearTimer()
    setStatus('playing')
    setTotal(0)
    setHistory([])
    setCurrentStep(0)
    runCountdown()
  }

  const runCountdown = () => {
    const seq = ['3', '2', '1']
    let idx = 0
    setDisplay(seq[0])

    timerRef.current = setInterval(() => {
      idx++
      if (idx < seq.length) {
        setDisplay(seq[idx])
      } else {
        clearTimer()
        runGameLoop()
      }
    }, 1000)
  }

  const runGameLoop = () => {
    let currentTotal = 0
    let steps = 0

    const tick = () => {
      if (steps >= targetSteps) {
        finishGame(currentTotal)
        return
      }

      const n = Math.floor(Math.random() * 9) + 1
      let add = Math.random() > 0.5
      if (!add && currentTotal - n < 0) add = true

      currentTotal = add ? currentTotal + n : currentTotal - n
      const opStr = add ? `+${n}` : `-${n}`

      setDisplay(opStr)
      setTotal(currentTotal)
      setHistory((h) => [...h, opStr])
      setCurrentStep(steps + 1)
      steps++
    }

    tick()
    timerRef.current = setInterval(tick, speed * 1000)
  }

  const finishGame = (finalTotal: number) => {
    clearTimer()
    setTotal(finalTotal)
    setStatus('pending')
    setDisplay('?')
    setUserAnswer('')
    setIsCorrect(null)
  }

  const checkAnswer = () => {
    const ans = parseInt(userAnswer, 10)
    const correct = ans === total
    setIsCorrect(correct)
    setStatus('result')
  }

  if (status === 'config') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Kettenrechner' }} />
        <View style={styles.configCard}>
          <Text style={styles.title}>Kettenrechner</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Geschwindigkeit</Text>
            <View style={styles.adjustGroup}>
              <Pressable
                style={styles.adjustButton}
                onPress={() => setSpeed(Math.max(KETTENRECHNER.SPEED_MIN, speed - 1))}
              >
                <Text style={styles.adjustText}>-</Text>
              </Pressable>
              <Text style={styles.settingValue}>{speed}s</Text>
              <Pressable
                style={styles.adjustButton}
                onPress={() => setSpeed(Math.min(KETTENRECHNER.SPEED_MAX, speed + 1))}
              >
                <Text style={styles.adjustText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Schritte</Text>
            <View style={styles.adjustGroup}>
              <Pressable
                style={styles.adjustButton}
                onPress={() => setTargetSteps(Math.max(KETTENRECHNER.STEPS_MIN, targetSteps - 1))}
              >
                <Text style={styles.adjustText}>-</Text>
              </Pressable>
              <Text style={styles.settingValue}>{targetSteps}</Text>
              <Pressable style={styles.adjustButton} onPress={() => setTargetSteps(targetSteps + 1)}>
                <Text style={styles.adjustText}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.startButton} onPress={startGame}>
            <Text style={styles.startText}>Start</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  if (status === 'playing') {
    const isCountdown = ['3', '2', '1'].includes(display)
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: `${currentStep}/${targetSteps}` }} />
        <Text style={[styles.display, { color: isCountdown ? colors.action : colors.primary }]}>
          {display}
        </Text>
      </View>
    )
  }

  if (status === 'pending') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Antwort?' }} />
        <NumberPad value={userAnswer} onChange={setUserAnswer} onSubmit={checkAnswer} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Ergebnis' }} />
      <Text style={styles.resultEmoji}>{isCorrect ? '!' : 'X'}</Text>
      <Text style={[styles.resultValue, { color: isCorrect ? colors.success : colors.action }]}>
        {total}
      </Text>
      <Text style={styles.history}>
        0 {history.join(' ')} = {total}
      </Text>
      <Pressable style={[styles.startButton, { marginTop: 32, width: '100%' }]} onPress={startGame}>
        <Text style={styles.startText}>Nochmal</Text>
      </Pressable>
      <Pressable onPress={() => setStatus('config')} style={{ marginTop: 12 }}>
        <Text style={{ color: colors.secondary }}>Einstellungen</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  configCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLabel: { color: colors.primary, fontWeight: '600' },
  settingValue: {
    color: colors.secondary,
    fontFamily: 'monospace',
    minWidth: 40,
    textAlign: 'center',
  },
  adjustGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adjustButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.canvas,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustText: { fontSize: 20, color: colors.primary, fontWeight: 'bold' },
  startButton: {
    backgroundColor: colors.action,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
  },
  startText: { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' },
  display: { fontSize: 96, fontWeight: '900' },
  resultEmoji: { fontSize: 64, marginBottom: 16, color: colors.primary },
  resultValue: { fontSize: 64, fontWeight: '900' },
  history: { color: colors.secondary, fontSize: 14, marginTop: 16, fontFamily: 'monospace' },
})
