import { describe, test, expect } from 'vitest'

import { findGlideOneIndex } from './jumpMarks'

const point = (flTime, hSpeed, vSpeed) => ({ flTime, hSpeed, vSpeed })

describe('findGlideOneIndex', () => {
  test('returns the first point after which glide stays above 1.0 for 3 seconds', () => {
    const points = [
      point(0, 0, 0),
      point(1, 10, 40),
      point(2, 50, 60),
      point(3, 80, 70),
      point(4, 60, 70),
      point(5, 90, 80),
      point(6, 100, 80),
      point(7, 110, 75),
      point(8, 120, 70)
    ]

    expect(findGlideOneIndex(points)).toBe(5)
  })

  test('ignores standing still before exit', () => {
    const points = [point(0, 2, 0), point(1, 2, 1), point(2, 2, 0), point(3, 2, 1)]

    expect(findGlideOneIndex(points)).toBeNull()
  })

  test('stops at the end of the window', () => {
    const points = [point(0, 0, 20), point(1, 50, 30), point(2, 50, 30), point(4, 50, 30)]

    expect(findGlideOneIndex(points, { toFlTime: 3 })).toBeNull()
    expect(findGlideOneIndex(points)).toBe(1)
  })
})
