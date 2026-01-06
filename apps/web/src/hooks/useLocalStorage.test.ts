import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useLocalStorage,
  useLocalStorageString,
  useLocalStorageNumber,
  useLocalStorageBoolean,
} from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('useLocalStorage (generic)', () => {
    it('returns initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', { foo: 'bar' }))
      expect(result.current[0]).toEqual({ foo: 'bar' })
    })

    it('reads existing value from localStorage', () => {
      localStorage.setItem('test-key', JSON.stringify({ foo: 'stored' }))
      const { result } = renderHook(() => useLocalStorage('test-key', { foo: 'bar' }))
      expect(result.current[0]).toEqual({ foo: 'stored' })
    })

    it('updates localStorage when value changes', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', { foo: 'bar' }))
      
      act(() => {
        result.current[1]({ foo: 'updated' })
      })
      
      expect(result.current[0]).toEqual({ foo: 'updated' })
      expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual({ foo: 'updated' })
    })

    it('supports functional updates', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0))
      
      act(() => {
        result.current[1](prev => prev + 1)
      })
      
      expect(result.current[0]).toBe(1)
    })
  })

  describe('useLocalStorageString', () => {
    it('returns initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorageString('str-key', 'default'))
      expect(result.current[0]).toBe('default')
    })

    it('reads existing string value', () => {
      localStorage.setItem('str-key', 'stored-value')
      const { result } = renderHook(() => useLocalStorageString('str-key', 'default'))
      expect(result.current[0]).toBe('stored-value')
    })

    it('persists string changes', () => {
      const { result } = renderHook(() => useLocalStorageString('str-key', 'default'))
      
      act(() => {
        result.current[1]('new-value')
      })
      
      expect(result.current[0]).toBe('new-value')
      expect(localStorage.getItem('str-key')).toBe('new-value')
    })
  })

  describe('useLocalStorageNumber', () => {
    it('returns initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorageNumber('num-key', 42))
      expect(result.current[0]).toBe(42)
    })

    it('reads existing number value', () => {
      localStorage.setItem('num-key', '100')
      const { result } = renderHook(() => useLocalStorageNumber('num-key', 42))
      expect(result.current[0]).toBe(100)
    })

    it('persists number changes', () => {
      const { result } = renderHook(() => useLocalStorageNumber('num-key', 42))
      
      act(() => {
        result.current[1](99)
      })
      
      expect(result.current[0]).toBe(99)
      expect(localStorage.getItem('num-key')).toBe('99')
    })
  })

  describe('useLocalStorageBoolean', () => {
    it('returns initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorageBoolean('bool-key', true))
      expect(result.current[0]).toBe(true)
    })

    it('reads existing boolean value (true)', () => {
      localStorage.setItem('bool-key', 'true')
      const { result } = renderHook(() => useLocalStorageBoolean('bool-key', false))
      expect(result.current[0]).toBe(true)
    })

    it('reads existing boolean value (false)', () => {
      localStorage.setItem('bool-key', 'false')
      const { result } = renderHook(() => useLocalStorageBoolean('bool-key', true))
      expect(result.current[0]).toBe(false)
    })

    it('persists boolean changes', () => {
      const { result } = renderHook(() => useLocalStorageBoolean('bool-key', false))
      
      act(() => {
        result.current[1](true)
      })
      
      expect(result.current[0]).toBe(true)
      expect(localStorage.getItem('bool-key')).toBe('true')
    })
  })
})
