/**
 * Shared game state types.
 */

export type GameStatus = 'config' | 'playing' | 'pending' | 'finished' | 'result'

export interface GameConfig {
  speed: number
  steps: number
}

/**
 * Utility to shuffle an array (Fisher-Yates).
 * Platform-agnostic, works on web and React Native.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}
