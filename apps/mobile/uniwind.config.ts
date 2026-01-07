/**
 * Uniwind configuration file.
 * Custom theme colors for the app - can be used with StyleSheet or future uniwind integration.
 */

// Custom theme colors (matching web app)
export const colors = {
  canvas: '#0B0E14',
  surface: '#151A23',
  surfaceHover: '#1E2532',
  subtle: '#2A3441',
  primary: '#F1F5F9',
  secondary: '#94A3B8',
  action: '#3B82F6',
  success: '#10B981',
  icon: '#64748B',
  mutedRed: '#EF4444',
  mutedOrange: '#F97316',
} as const

export type ColorKey = keyof typeof colors
