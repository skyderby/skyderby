import { describe, test, expect } from 'vitest'
import {
  timeOf,
  interpolateAtIndex,
  indexAtTime,
  futureIndexFrom,
  targetIndexFrom,
  headingAtIndex,
  nearestIndexByTime,
  altitudeCrossing,
  valueAtCrossing,
  interpolatePointByAltitude,
  interpolatePointByTime,
  findLineCrossing,
  interpolateByPlayerTime
} from './pointHelpers'

const base = new Date('2026-07-28T02:38:00Z').getTime()

const points = Array.from({ length: 6 }, (_, i) => ({
  gpsTime: new Date(base + i * 1000),
  playerTime: i,
  latitude: 45 + 0.001 * i,
  longitude: 30,
  altitude: 3000 - 100 * i,
  distance: 100 * i,
  hSpeed: 100 + 10 * i,
  vSpeed: 50,
  fullSpeed: 120,
  glideRatio: 2
}))

describe('timeOf', () => {
  test('handles Date, number and string', () => {
    expect(timeOf({ gpsTime: new Date(base) })).toBe(base)
    expect(timeOf({ gpsTime: base })).toBe(base)
    expect(timeOf({ gpsTime: new Date(base).toISOString() })).toBe(base)
  })
})

describe('interpolateAtIndex', () => {
  test('interpolates default indicator keys', () => {
    const result = interpolateAtIndex(points, 1, 0.5)
    expect(result.altitude).toBe(2850)
    expect(result.hSpeed).toBe(115)
    expect(result.glideRatio).toBe(2)
  })

  test('clamps at the last point', () => {
    expect(interpolateAtIndex(points, 5, 0.5).altitude).toBe(2500)
  })
})

describe('indexAtTime', () => {
  test('finds segment and fraction', () => {
    expect(indexAtTime(points, base + 2500)).toEqual({ index: 2, fraction: 0.5 })
  })

  test('falls back to the last index', () => {
    expect(indexAtTime(points, base + 99000)).toEqual({ index: 5, fraction: 0 })
  })
})

describe('futureIndexFrom / targetIndexFrom', () => {
  test('returns the first index at or after the offset', () => {
    expect(futureIndexFrom(points, 0, 1000)).toBe(1)
    expect(futureIndexFrom(points, 0, 2500)).toBe(3)
  })

  test('futureIndexFrom returns null past the end, targetIndexFrom clamps', () => {
    expect(futureIndexFrom(points, 4, 5000)).toBeNull()
    expect(targetIndexFrom(points, 4, 5000)).toBe(5)
  })
})

describe('headingAtIndex', () => {
  test('returns interpolated position and heading towards the target', () => {
    const { point, heading } = headingAtIndex(points, 0, 0.5)
    expect(point.latitude).toBeCloseTo(45.0005)
    expect(heading).toBeCloseTo(0)
  })
})

describe('nearestIndexByTime', () => {
  test('picks the closest sample', () => {
    expect(nearestIndexByTime(points, base + 2400)).toBe(2)
    expect(nearestIndexByTime(points, base + 2600)).toBe(3)
  })
})

describe('altitudeCrossing', () => {
  test('finds descending crossing with fraction', () => {
    expect(altitudeCrossing(points, 2750)).toEqual({ index: 2, fraction: 0.5 })
    expect(valueAtCrossing(points, altitudeCrossing(points, 2750), 'distance')).toBe(250)
  })

  test('returns null when altitude is outside the track', () => {
    expect(altitudeCrossing(points, 100)).toBeNull()
  })
})

describe('interpolatePointByAltitude', () => {
  test('returns interpolated point with Date gpsTime', () => {
    const point = interpolatePointByAltitude(points, 2750)
    expect(point.altitude).toBe(2750)
    expect(point.latitude).toBeCloseTo(45.0025)
    expect(point.gpsTime).toBeInstanceOf(Date)
    expect(point.gpsTime.getTime()).toBe(base + 2500)
  })

  test('returns the exact point on equality', () => {
    expect(interpolatePointByAltitude(points, 2800)).toBe(points[2])
  })

  test('skips ascending crossings when descendingOnly is set', () => {
    const climbThenDescend = [
      { ...points[0], altitude: 2700 },
      { ...points[1], altitude: 2900 },
      ...points.slice(2)
    ]
    expect(interpolatePointByAltitude(climbThenDescend, 2750).gpsTime.getTime()).toBe(
      base + 250
    )
    expect(
      interpolatePointByAltitude(climbThenDescend, 2750, {
        descendingOnly: true
      }).gpsTime.getTime()
    ).toBe(base + 2500)
  })
})

describe('interpolatePointByTime', () => {
  test('interpolates position and altitude', () => {
    const point = interpolatePointByTime(points, base + 1500)
    expect(point.altitude).toBe(2850)
    expect(point.gpsTime.getTime()).toBe(base + 1500)
  })

  test('returns null outside the range', () => {
    expect(interpolatePointByTime(points, base - 1)).toBeNull()
  })
})

describe('findLineCrossing', () => {
  test('finds the segment crossing a finish line', () => {
    const line = {
      start: { latitude: 45.0025, longitude: 29.9 },
      end: { latitude: 45.0025, longitude: 30.1 }
    }
    const crossing = findLineCrossing(points, line)
    expect(crossing.index).toBe(3)
    expect(crossing.fraction).toBeCloseTo(0.5)
    expect(crossing.latitude).toBeCloseTo(45.0025)
  })

  test('returns null when the line is not crossed', () => {
    const line = {
      start: { latitude: 46, longitude: 29.9 },
      end: { latitude: 46, longitude: 30.1 }
    }
    expect(findLineCrossing(points, line)).toBeNull()
  })
})

describe('interpolateByPlayerTime', () => {
  test('interpolates indicator values and distance', () => {
    const result = interpolateByPlayerTime(points, 1.5)
    expect(result.distance).toBe(150)
    expect(result.hSpeed).toBe(115)
  })

  test('clamps outside the range', () => {
    expect(interpolateByPlayerTime(points, -1)).toBe(points[0])
    expect(interpolateByPlayerTime(points, 10)).toBe(points[5])
  })
})
