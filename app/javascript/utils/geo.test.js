import { describe, test, expect } from 'vitest'
import {
  haversineDistance,
  calculateBearing,
  segmentIntersection,
  crossTrackDistance,
  vincentyDistance,
  vincentyBearing,
  vincentyDestination,
  vincentyMidpoint
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

const flindersPeak = p(-37.95103341666667, 144.42486788888888)
const buninyong = p(-37.65282113888889, 143.92649552777777)

describe('vincenty', () => {
  test('matches the reference geodesic between Flinders Peak and Buninyong', () => {
    expect(vincentyDistance(flindersPeak, buninyong)).toBeCloseTo(54972.271, 2)
    expect(vincentyBearing(flindersPeak, buninyong)).toBeCloseTo(306.8681575, 5)
  })

  test('destination solves the direct problem', () => {
    const point = vincentyDestination(flindersPeak, 54972.271, 306.8681575)

    expect(point.latitude).toBeCloseTo(buninyong.latitude, 6)
    expect(point.longitude).toBeCloseTo(buninyong.longitude, 6)
  })

  test('accepts string coordinates and returns zero for the same point', () => {
    expect(vincentyDistance(p('53.62', '-114.22'), p('53.63', '-114.17'))).toBeCloseTo(
      3490.389,
      2
    )
    expect(vincentyDistance(p(1, 2), p(1, 2))).toBe(0)
  })

  test('measures short track segments', () => {
    expect(vincentyDistance(p(53.62, -114.22), p(53.62005, -114.22))).toBeCloseTo(5.5649, 3)
  })

  test('midpoint is equidistant from both ends', () => {
    const middle = vincentyMidpoint(flindersPeak, buninyong)

    expect(vincentyDistance(flindersPeak, middle)).toBeCloseTo(
      vincentyDistance(middle, buninyong),
      3
    )
  })
})
