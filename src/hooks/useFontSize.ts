import { useLocalStorageNumber } from './useLocalStorage'

export interface UseFontSizeOptions {
  storageKey: string
  defaultSize?: number
  min?: number
  max?: number
  step?: number
}

export function useFontSize(options: UseFontSizeOptions) {
  const { storageKey, defaultSize = 4, min = 2, max = 10, step = 1 } = options

  const [fontSize, setFontSize] = useLocalStorageNumber(storageKey, defaultSize)

  const adjustFontSize = (delta: number) => {
    const currentSize = fontSize ?? defaultSize
    const newSize = currentSize + delta
    setFontSize(Math.max(min, Math.min(max, newSize)))
  }

  const increaseFontSize = () => adjustFontSize(step)
  const decreaseFontSize = () => adjustFontSize(-step)

  return {
    fontSize: fontSize ?? defaultSize,
    setFontSize,
    adjustFontSize,
    increaseFontSize,
    decreaseFontSize,
  } as const
}
