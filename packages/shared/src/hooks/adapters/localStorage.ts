import type { StorageAdapter } from '../useStorage'

/**
 * localStorage adapter for web platform.
 * Wraps synchronous localStorage in Promise API for consistency.
 */
export const localStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string) => {
    localStorage.setItem(key, value)
  },
  removeItem: async (key: string) => {
    localStorage.removeItem(key)
  },
}
