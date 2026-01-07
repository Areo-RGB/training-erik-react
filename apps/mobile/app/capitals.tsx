import { useState, useEffect, useRef } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { useStorage, numberSerializer } from '@training-erik/shared'
import { CAPITALS, EUROPE_CAPITALS, shuffleArray } from '@training-erik/shared'
import { asyncStorageAdapter } from '../hooks/asyncStorageAdapter'

const colors = {
  canvas: '#0B0E14',
  surface: '#151A23',
  subtle: '#2A3441',
  primary: '#F1F5F9',
  secondary: '#94A3B8',
  action: '#3B82F6',
  success: '#10B981',
  icon: '#64748B',
}

interface Question {
  country: string
  capital: string
}

export default function Capitals() {
  const [speed, setSpeed] = useStorage('capitals_speed', CAPITALS.DEFAULT_SPEED, asyncStorageAdapter, numberSerializer)
  const [steps, setSteps] = useStorage('capitals_steps', CAPITALS.DEFAULT_STEPS, asyncStorageAdapter, numberSerializer)

  const [status, setStatus] = useState<'config' | 'playing' | 'finished'>('config')
  const [currentStep, setCurrentStep] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question>({ country: '', capital: '' })

  const shuffledDataRef = useRef<Question[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const answerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (answerTimeoutRef.current) clearTimeout(answerTimeoutRef.current)
  }

  useEffect(() => () => clearTimers(), [])

  const runStep = (stepIndex: number, gameSteps: number, gameSpeed: number) => {
    if (stepIndex >= gameSteps) {
      setStatus('finished')
      return
    }

    clearTimers()
    setCurrentQuestion(shuffledDataRef.current[stepIndex])
    setShowAnswer(false)

    answerTimeoutRef.current = setTimeout(() => {
      setShowAnswer(true)
    }, (gameSpeed * 1000) / 2)

    timerRef.current = setTimeout(() => {
      const nextStep = stepIndex + 1
      setCurrentStep(nextStep)
      runStep(nextStep, gameSteps, gameSpeed)
    }, gameSpeed * 1000)
  }

  const startGame = () => {
    shuffledDataRef.current = shuffleArray(EUROPE_CAPITALS)
    setCurrentStep(0)
    setStatus('playing')
    runStep(0, steps, speed)
  }

  if (status === 'config') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Hauptstädte Quiz' }} />
        <View style={styles.configCard}>
          <Text style={styles.title}>Hauptstädte Quiz</Text>
          <Text style={styles.subtitle}>Europäische Hauptstädte lernen</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Geschwindigkeit</Text>
            <View style={styles.adjustGroup}>
              <Pressable style={styles.adjustButton} onPress={() => setSpeed(Math.max(1, speed - 1))}>
                <Text style={styles.adjustText}>-</Text>
              </Pressable>
              <Text style={styles.settingValue}>{speed}s</Text>
              <Pressable style={styles.adjustButton} onPress={() => setSpeed(Math.min(10, speed + 1))}>
                <Text style={styles.adjustText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Anzahl</Text>
            <View style={styles.adjustGroup}>
              <Pressable style={styles.adjustButton} onPress={() => setSteps(Math.max(5, steps - 5))}>
                <Text style={styles.adjustText}>-</Text>
              </Pressable>
              <Text style={styles.settingValue}>{steps}</Text>
              <Pressable style={styles.adjustButton} onPress={() => setSteps(Math.min(45, steps + 5))}>
                <Text style={styles.adjustText}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.startButton} onPress={startGame}>
            <Text style={styles.startText}>Quiz Starten</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  if (status === 'playing') {
    const progress = (currentStep / steps) * 100
    return (
      <View style={styles.playContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.country}>{currentQuestion.country}</Text>
        {showAnswer && <Text style={styles.capital}>{currentQuestion.capital}</Text>}

        <Text style={styles.stepCounter}>{currentStep + 1} / {steps}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Fertig!' }} />
      <Text style={styles.finishedEmoji}>🎉</Text>
      <Text style={styles.finishedText}>Quiz Beendet!</Text>
      <Text style={styles.finishedSub}>Alle {steps} Fragen abgeschlossen</Text>

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
  container: { flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: 16 },
  configCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { color: colors.secondary, textAlign: 'center', marginBottom: 24 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  settingLabel: { color: colors.primary, fontWeight: '600' },
  settingValue: { color: colors.secondary, fontFamily: 'monospace', minWidth: 40, textAlign: 'center' },
  adjustGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adjustButton: { width: 40, height: 40, backgroundColor: colors.canvas, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  adjustText: { fontSize: 20, color: colors.primary, fontWeight: 'bold' },
  startButton: { backgroundColor: colors.action, borderRadius: 12, paddingVertical: 16, marginTop: 24 },
  startText: { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' },
  playContainer: { flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: 16 },
  progressBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: colors.subtle },
  progressFill: { height: 4, backgroundColor: colors.action },
  country: { fontSize: 36, fontWeight: '900', color: colors.primary, textAlign: 'center' },
  capital: { fontSize: 24, fontWeight: 'bold', color: colors.success, marginTop: 32 },
  stepCounter: { position: 'absolute', bottom: 32, color: colors.icon, fontWeight: 'bold' },
  finishedEmoji: { fontSize: 64, marginBottom: 16 },
  finishedText: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
  finishedSub: { color: colors.secondary, marginTop: 8 },
})
