import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { useStorage, numberSerializer } from '@training-erik/shared'
import { FARBEN, STROOP_COLORS, type StroopColorKey } from '@training-erik/shared/constants'
import { asyncStorageAdapter } from '../hooks/asyncStorageAdapter'

const colors = {
  canvas: '#0B0E14',
  surface: '#151A23',
  primary: '#F1F5F9',
  secondary: '#94A3B8',
  action: '#3B82F6',
}

const colorKeys = Object.keys(STROOP_COLORS) as StroopColorKey[]

export default function Farben() {
  const [intervalMs, setIntervalMs] = useStorage('farben_interval', FARBEN.DEFAULT_INTERVAL_MS, asyncStorageAdapter, numberSerializer)
  const [limitSteps, setLimitSteps] = useStorage('farben_steps', FARBEN.DEFAULT_STEPS, asyncStorageAdapter, numberSerializer)

  const [status, setStatus] = useState<'config' | 'playing' | 'finished'>('config')
  const [currentColor, setCurrentColor] = useState<StroopColorKey>('white')
  const [currentStep, setCurrentStep] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopGame = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStatus('finished')
  }, [])

  const step = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= limitSteps) {
        stopGame()
        return prev
      }
      return prev + 1
    })

    setCurrentColor((prevColor) => {
      const candidates = colorKeys.filter((c) => c !== prevColor)
      return candidates[Math.floor(Math.random() * candidates.length)]
    })
  }, [limitSteps, stopGame])

  const startGame = () => {
    setStatus('playing')
    setCurrentStep(0)
    step()
    intervalRef.current = setInterval(step, intervalMs)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (status === 'config') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Farben' }} />
        <View style={styles.configCard}>
          <Text style={styles.title}>Farben Training</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Geschwindigkeit</Text>
            <View style={styles.adjustGroup}>
              <Pressable style={styles.adjustButton} onPress={() => setIntervalMs(Math.max(500, intervalMs - 500))}>
                <Text style={styles.adjustText}>-</Text>
              </Pressable>
              <Text style={styles.settingValue}>{intervalMs}ms</Text>
              <Pressable style={styles.adjustButton} onPress={() => setIntervalMs(intervalMs + 500)}>
                <Text style={styles.adjustText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Anderungen</Text>
            <View style={styles.adjustGroup}>
              <Pressable style={styles.adjustButton} onPress={() => setLimitSteps(Math.max(5, limitSteps - 5))}>
                <Text style={styles.adjustText}>-</Text>
              </Pressable>
              <Text style={styles.settingValue}>{limitSteps}</Text>
              <Pressable style={styles.adjustButton} onPress={() => setLimitSteps(limitSteps + 5)}>
                <Text style={styles.adjustText}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.startButton} onPress={startGame}>
            <Text style={styles.startText}>Training Starten</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  const colorHex = STROOP_COLORS[currentColor].hex

  if (status === 'playing') {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colorHex }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.counter}>{currentStep} / {limitSteps}</Text>
        <Pressable style={styles.stopButton} onPress={stopGame}>
          <Text style={styles.stopText}>Stopp</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={[styles.fullScreen, { backgroundColor: colorHex }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Pressable style={styles.restartButton} onPress={startGame}>
        <Text style={styles.restartText}>Noch einmal</Text>
      </Pressable>
      <Pressable onPress={() => setStatus('config')} style={{ marginTop: 16 }}>
        <Text style={{ color: 'white' }}>Einstellungen</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: 16 },
  configCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 24 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  settingLabel: { color: colors.primary, fontWeight: '600' },
  settingValue: { color: colors.secondary, fontFamily: 'monospace', minWidth: 60, textAlign: 'center' },
  adjustGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adjustButton: { width: 40, height: 40, backgroundColor: colors.canvas, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  adjustText: { fontSize: 20, color: colors.primary, fontWeight: 'bold' },
  startButton: { backgroundColor: colors.action, borderRadius: 12, paddingVertical: 16, marginTop: 24 },
  startText: { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' },
  fullScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  counter: { position: 'absolute', top: 16, left: 16, color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  stopButton: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  stopText: { color: 'white', fontWeight: '600' },
  restartButton: { backgroundColor: 'white', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  restartText: { color: 'black', fontWeight: 'bold', fontSize: 20 },
})
