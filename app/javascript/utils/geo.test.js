import { describe, test, expect } from 'vitest'
import {
  haversineDistance,
  calculateBearing,
  segmentIntersection,
  crossTrackDistance
} from './geo'

const p = (latitude, longitude) => ({ latitude, longitude })

describe('haversineDistance', () => {
  test('one degree of latitude is about 111 km', () => {
    expect(haversineDistance(p(0, 0), p(1, 0))).toBeCloseTo(111195, -1)
  })
})

describe('calculateBearing', () => {
  test('north is 0, east is 90', () => {
    expect(calculateBearing(p(0, 0), p(1, 0))).toBeCloseTo(0)
    expect(calculateBearing(p(0, 0), p(0, 1))).toBeCloseTo(90)
  })

  test('west is normalized to 270', () => {
    expect(calculateBearing(p(0, 0), p(0, -1))).toBeCloseTo(270)
  })
})

describe('segmentIntersection', () => {
  test('returns crossing point and fraction along the first segment', () => {
    const hit = segmentIntersection(p(0, 0), p(0, 2), p(-1, 1), p(1, 1))
    expect(hit.latitude).toBeCloseTo(0)
    expect(hit.longitude).toBeCloseTo(1)
    expect(hit.fraction).toBeCloseTo(0.5)
  })

  test('returns null when segments do not cross', () => {
    expect(segmentIntersection(p(0, 0), p(0, 2), p(1, 3), p(2, 3))).toBeNull()
  })

  test('returns null for parallel segments', () => {
    expect(segmentIntersection(p(0, 0), p(0, 2), p(1, 0), p(1, 2))).toBeNull()
  })
})

describe('crossTrackDistance', () => {
  test('is zero on the line and signed off the line', () => {
    const start = p(0, 0)
    const end = p(1, 0)
    expect(crossTrackDistance(p(0.5, 0), start, end)).toBeCloseTo(0, 3)
    expect(crossTrackDistance(p(0.5, 0.01), start, end)).toBeGreaterThan(1000)
    expect(crossTrackDistance(p(0.5, -0.01), start, end)).toBeLessThan(-1000)
  })
})
