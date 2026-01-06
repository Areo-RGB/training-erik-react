import { useState, useCallback, useEffect } from 'react'

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

export interface Serializer<T> {
  serialize: (value: T) => string
  deserialize: (raw: string) => T
}

const jsonSerializer = <T>(): Serializer<T> => ({
  serialize: (value: T) => JSON.stringify(value),
  deserialize: (raw: string) => JSON.parse(raw) as T,
})

/**
 * Cross-platform storage hook with adapter pattern.
 * Works with localStorage (web) or AsyncStorage (React Native).
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
  adapter: StorageAdapter,
  serializer: Serializer<T> = jsonSerializer<T>()
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial value from storage
  useEffect(() => {
    let mounted = true

    adapter.getItem(key).then((item) => {
      if (mounted && item !== null) {
        try {
          setStoredValue(serializer.deserialize(item))
        } catch {
          // Keep initial value on parse error
        }
      }
      if (mounted) setIsLoading(false)
    }).catch(() => {
      if (mounted) setIsLoading(false)
    })

    return () => { mounted = false }
  }, [key, adapter, serializer])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value
        adapter.setItem(key, serializer.serialize(valueToStore)).catch((error) => {
          console.error('Error saving to storage:', error)
        })
        return valueToStore
      })
    },
    [key, adapter, serializer]
  )

  return [storedValue, setValue, isLoading]
}

// Type-specific serializers
export const stringSerializer: Serializer<string> = {
  serialize: (value) => value,
  deserialize: (raw) => raw,
}

export const numberSerializer: Serializer<number> = {
  serialize: (value) => String(value),
  deserialize: (raw) => parseInt(raw, 10),
}

export const booleanSerializer: Serializer<boolean> = {
  serialize: (value) => String(value),
  deserialize: (raw) => raw === 'true',
}
