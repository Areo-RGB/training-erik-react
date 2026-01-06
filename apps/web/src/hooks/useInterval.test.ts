import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInterval } from './useInterval'

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls callback at specified interval', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, 1000))

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('does not call callback when delay is null', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, null))

    vi.advanceTimersByTime(5000)
    expect(callback).not.toHaveBeenCalled()
  })

  it('clears interval on unmount', () => {
    const callback = vi.fn()
    const { unmount } = renderHook(() => useInterval(callback, 1000))

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    unmount()

    vi.advanceTimersByTime(3000)
    expect(callback).toHaveBeenCalledTimes(1) // Still 1, not called after unmount
  })

  it('updates interval when delay changes', () => {
    const callback = vi.fn()
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 as number | null } }
    )

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    // Change delay to 500ms
    rerender({ delay: 500 })

    vi.advanceTimersByTime(500)
    expect(callback).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(500)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('uses latest callback on each tick', () => {
    let counter = 0
    const { rerender } = renderHook(
      ({ callback }) => useInterval(callback, 1000),
      { initialProps: { callback: () => { counter = 1 } } }
    )

    vi.advanceTimersByTime(1000)
    expect(counter).toBe(1)

    // Update callback
    rerender({ callback: () => { counter = 99 } })

    vi.advanceTimersByTime(1000)
    expect(counter).toBe(99)
  })
})
