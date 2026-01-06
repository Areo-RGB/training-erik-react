/**
 * Web-specific constants (audio requires Web Audio API).
 */

export const AUDIO = {
  DEFAULT_THRESHOLD: 50,
  DEFAULT_COOLDOWN: 500,
  THRESHOLD_MIN: 1,
  THRESHOLD_MAX: 100,
  COOLDOWN_MIN: 100,
  COOLDOWN_MAX: 2000,
  COOLDOWN_STEP: 100,
} as const

export const RATE_TRACKING = {
  WINDOW_MS: 1000,
  MAX_TIMESTAMPS: 100,
} as const

export const ANIMATION = {
  TRIGGER_DURATION_MS: 150,
} as const

// Re-export shared constants for convenience
export { FONT_SIZE, FARBEN, CAPITALS, KETTENRECHNER } from '@training-erik/shared/constants'
