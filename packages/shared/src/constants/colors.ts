/**
 * Color definitions for Stroop effect game.
 */

export interface ColorConfig {
  id: string
  label: string
  german: string
  hex: string
}

export const STROOP_COLORS: Record<string, ColorConfig> = {
  white: { id: 'white', label: 'White', german: 'weiß', hex: '#F3F4F6' },
  red: { id: 'red', label: 'Red', german: 'rot', hex: '#DC2626' },
  blue: { id: 'blue', label: 'Blue', german: 'blau', hex: '#2563EB' },
  green: { id: 'green', label: 'Green', german: 'grün', hex: '#16A34A' },
  yellow: { id: 'yellow', label: 'Yellow', german: 'gelb', hex: '#FACC15' },
} as const

export type StroopColorKey = keyof typeof STROOP_COLORS
