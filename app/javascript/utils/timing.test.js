import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce, throttle } from './timing'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('debounce', () => {
  test('calls once with the last arguments after the wait', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced(1)
    debounced(2)
    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)
  })

  test('keeps the call-site this', () => {
    const owner = {
      value: 42,
      read: debounce(function () {
        this.seen = this.value
      }, 10)
    }

    owner.read()
    vi.advanceTimersByTime(10)
    expect(owner.seen).toBe(42)
  })

  test('cancel drops the pending call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('throttle', () => {
  test('calls immediately and then once more with the latest arguments', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 1000)

    throttled('a')
    throttled('b')
    throttled('c')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith('a')

    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('c')
  })

  test('cancel drops the trailing call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 1000)

    throttled('a')
    throttled('b')
    throttled.cancel()
    vi.advanceTimersByTime(2000)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
