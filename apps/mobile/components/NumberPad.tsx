import { View, Text, Pressable, StyleSheet } from 'react-native'

const colors = {
  canvas: '#0B0E14',
  surface: '#151A23',
  primary: '#F1F5F9',
  action: '#3B82F6',
}

interface NumberPadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export function NumberPad({ value, onChange, onSubmit }: NumberPadProps) {
  const handlePress = (digit: string) => {
    if (digit === 'C') {
      onChange('')
    } else if (digit === '⌫') {
      onChange(value.slice(0, -1))
    } else if (digit === '±') {
      onChange(value.startsWith('-') ? value.slice(1) : '-' + value)
    } else {
      onChange(value + digit)
    }
  }

  const buttons = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '±', '0', '⌫']

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.displayText}>{value || '0'}</Text>
      </View>

      <View style={styles.grid}>
        {buttons.map((btn) => (
          <Pressable key={btn} style={styles.button} onPress={() => handlePress(btn)}>
            <Text style={styles.buttonText}>{btn}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.submitButton} onPress={onSubmit}>
        <Text style={styles.submitText}>Prufen</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 320, alignSelf: 'center' },
  display: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  displayText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  button: {
    width: 80,
    height: 64,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
  submitButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.action,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
})
