/**
 * Application-wide constants and default values.
 * Centralizes magic numbers for maintainability.
 */

// Audio/Microphone defaults
export const AUDIO = {
  DEFAULT_THRESHOLD: 50,
  DEFAULT_COOLDOWN: 500,
  THRESHOLD_MIN: 1,
  THRESHOLD_MAX: 100,
  COOLDOWN_MIN: 100,
  COOLDOWN_MAX: 2000,
  COOLDOWN_STEP: 100,
} as const

// Font size defaults (in rem)
export const FONT_SIZE = {
  SOUND_COUNTER: 8,
  CAPITALS: 5,
  KETTENRECHNER: 6,
  TIMER: 4,
  MIN: 4,
} as const

// Farben (Stroop) game defaults
export const FARBEN = {
  DEFAULT_INTERVAL_MS: 2000,
  DEFAULT_STEPS: 10,
  DEFAULT_DURATION_SEC: 20,
  INTERVAL_MIN: 500,
  DURATION_MIN: 5,
  STEPS_MIN: 5,
} as const

// Capitals quiz defaults
export const CAPITALS = {
  DEFAULT_SPEED: 4,
  DEFAULT_STEPS: 10,
} as const

// Kettenrechner (chain calculator) defaults
export const KETTENRECHNER = {
  DEFAULT_SPEED: 5,
  DEFAULT_STEPS: 5,
  SPEED_MIN: 1,
  SPEED_MAX: 30,
  STEPS_MIN: 1,
} as const

// Rate tracking
export const RATE_TRACKING = {
  WINDOW_MS: 1000,
  MAX_TIMESTAMPS: 100,
} as const

// Trigger animation
export const ANIMATION = {
  TRIGGER_DURATION_MS: 150,
} as const
