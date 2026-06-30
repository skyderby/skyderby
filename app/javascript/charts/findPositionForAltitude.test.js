import { describe, test, expect, vi } from 'vitest'

vi.mock('i18n', () => ({ default: { t: () => '' } }))

import { findPositionForAltitude } from './utils'

const points = [
  { altitude: 3000, flTime: 0 },
  { altitude: 2000, flTime: 10 },
  { altitude: 1000, flTime: 20 }
]

describe('findPositionForAltitude', () => {
  test('interpolates time between the bracketing points', () => {
    expect(findPositionForAltitude(points, 2500)).toBeCloseTo(5)
    expect(findPositionForAltitude(points, 2000)).toBeCloseTo(10)
  })

  test('returns null when the altitude is below every point', () => {
    expect(findPositionForAltitude(points, 500)).toBeNull()
  })

  test('returns the last point time when it matches the final point (no crash)', () => {
    expect(findPositionForAltitude(points, 1000)).toBeCloseTo(20)
  })
})
