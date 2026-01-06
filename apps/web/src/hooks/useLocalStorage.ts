import {
  useStorage,
  localStorageAdapter,
  stringSerializer,
  numberSerializer,
  booleanSerializer,
} from '@training-erik/shared'

/**
 * Generic localStorage hook with JSON serialization.
 * Supports functional updates: setValue(prev => prev + 1)
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useStorage(key, initialValue, localStorageAdapter)
  return [value, setValue]
}

/**
 * localStorage hook for string values (no JSON serialization).
 */
export function useLocalStorageString(
  key: string,
  initialValue: string
): [string, (value: string) => void] {
  const [value, setValue] = useStorage(key, initialValue, localStorageAdapter, stringSerializer)
  return [value, setValue]
}

/**
 * localStorage hook for number values.
 */
export function useLocalStorageNumber(
  key: string,
  initialValue: number
): [number, (value: number) => void] {
  const [value, setValue] = useStorage(key, initialValue, localStorageAdapter, numberSerializer)
  return [value, setValue]
}

/**
 * localStorage hook for boolean values.
 */
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useStorage(key, initialValue, localStorageAdapter, booleanSerializer)
  return [value, setValue]
}
