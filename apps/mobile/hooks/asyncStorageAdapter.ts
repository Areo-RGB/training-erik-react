import AsyncStorage from '@react-native-async-storage/async-storage'
import type { StorageAdapter } from '@training-erik/shared'

/**
 * AsyncStorage adapter for React Native.
 */
export const asyncStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value)
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key)
  },
}
