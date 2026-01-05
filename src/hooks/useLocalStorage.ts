import { useState, useCallback } from 'react'

type Serializer<T> = {
  serialize: (value: T) => string
  deserialize: (raw: string) => T
}

const jsonSerializer = <T>(): Serializer<T> => ({
  serialize: (value: T) => JSON.stringify(value),
  deserialize: (raw: string) => JSON.parse(raw) as T,
})

const stringSerializer: Serializer<string> = {
  serialize: (value: string) => value,
  deserialize: (raw: string) => raw,
}

const numberSerializer: Serializer<number> = {
  serialize: (value: number) => String(value),
  deserialize: (raw: string) => parseInt(raw, 10),
}

const booleanSerializer: Serializer<boolean> = {
  serialize: (value: boolean) => String(value),
  deserialize: (raw: string) => raw === 'true',
}

function createLocalStorageHook<T>(serializer: Serializer<T>) {
  return function useLocalStorageImpl(
    key: string,
    initialValue: T
  ): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
      try {
        const item = localStorage.getItem(key)
        return item !== null ? serializer.deserialize(item) : initialValue
      } catch {
        return initialValue
      }
    })

    const setValue = useCallback(
      (value: T | ((prev: T) => T)) => {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value
          try {
            localStorage.setItem(key, serializer.serialize(valueToStore))
          } catch (error) {
            console.error('Error saving to localStorage:', error)
          }
          return valueToStore
        })
      },
      [key]
    )

    return [storedValue, setValue]
  }
}

/**
 * Generic localStorage hook with JSON serialization.
 * Supports functional updates: setValue(prev => prev + 1)
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  return createLocalStorageHook(jsonSerializer<T>())(key, initialValue)
}

/**
 * localStorage hook for string values (no JSON serialization).
 */
export function useLocalStorageString(
  key: string,
  initialValue: string
): [string, (value: string) => void] {
  return createLocalStorageHook(stringSerializer)(key, initialValue)
}

/**
 * localStorage hook for number values.
 */
export function useLocalStorageNumber(
  key: string,
  initialValue: number
): [number, (value: number) => void] {
  return createLocalStorageHook(numberSerializer)(key, initialValue)
}

/**
 * localStorage hook for boolean values.
 */
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean
): [boolean, (value: boolean) => void] {
  return createLocalStorageHook(booleanSerializer)(key, initialValue)
}
