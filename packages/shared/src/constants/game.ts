/**
 * Game configuration constants.
 * Shared between web and mobile apps.
 */

export const FONT_SIZE = {
  SOUND_COUNTER: 8,
  CAPITALS: 5,
  KETTENRECHNER: 6,
  TIMER: 4,
  MIN: 4,
} as const

export const FARBEN = {
  DEFAULT_INTERVAL_MS: 2000,
  DEFAULT_STEPS: 10,
  DEFAULT_DURATION_SEC: 20,
  INTERVAL_MIN: 500,
  DURATION_MIN: 5,
  STEPS_MIN: 5,
} as const

export const CAPITALS = {
  DEFAULT_SPEED: 4,
  DEFAULT_STEPS: 10,
} as const

export const KETTENRECHNER = {
  DEFAULT_SPEED: 5,
  DEFAULT_STEPS: 5,
  SPEED_MIN: 1,
  SPEED_MAX: 30,
  STEPS_MIN: 1,
} as const
