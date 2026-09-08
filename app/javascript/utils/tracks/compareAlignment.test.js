import { describe, test, expect } from 'vitest'
import {
  buildProcessedPoints,
  windowEntryValue,
  windowEntryTime,
  alignCompareTrack
} from './compareAlignment'

const base = new Date('2026-07-28T02:38:00Z').getTime()

const track = ({ startTime, latitude = 45, seconds = 40 }) =>
  Array.from({ length: seconds + 1 }, (_, i) => ({
    gpsTime: new Date(startTime + i * 1000),
    flTime: i,
    latitude: latitude + 0.0005 * i,
    longitude: 30,
    altitude: 3000 - 50 * i,
    hSpeed: 100,
    vSpeed: 50,
    fullSpeed: 112,
    glideRatio: 2
  }))

const primary = track({ startTime: base })
const compare = track({ startTime: base + 10000, latitude: 46 })

describe('buildProcessedPoints', () => {
  test('computes player time, cumulative distance and keeps Date times', () => {
    const points = buildProcessedPoints(primary, { startTime: base + 5000 })

    expect(points[0].playerTime).toBe(-5)
    expect(points[0].distance).toBe(0)
    expect(points[2].distance).toBeGreaterThan(points[1].distance)
    expect(points[3].gpsTime).toBeInstanceOf(Date)
    expect(points[3].gpsTime.getTime()).toBe(base + 3000)
  })

  test('applies a time offset', () => {
    const points = buildProcessedPoints(compare, { startTime: base, timeOffset: -10000 })
    expect(points[0].playerTime).toBe(0)
    expect(points[0].srcGpsTime).toBe(compare[0].gpsTime)
  })
})

describe('window entry helpers', () => {
  test('interpolate values at the altitude crossing', () => {
    expect(windowEntryValue(primary, 2775, 'flTime')).toBe(4.5)
    expect(windowEntryTime(primary, 2775)).toBe(base + 4500)
  })

  test('fall back when the altitude is never crossed', () => {
    expect(windowEntryValue(primary, 5000, 'flTime')).toBe(0)
    expect(windowEntryTime(primary, 5000)).toBeNull()
  })
})

describe('alignCompareTrack', () => {
  const processedPoints = buildProcessedPoints(primary, { startTime: base })

  test('aligns the compare track on window entry', () => {
    const result = alignCompareTrack({
      points: primary,
      comparePoints: compare,
      chartPoints: primary,
      processedPoints,
      windowFrom: 2500,
      windowStartTime: base + 10000,
      windowEndTime: base + 30000
    })

    expect(result.timeOffset).toBe(-10000)
    expect(result.chartTimeOffset).toBe(7)
    expect(result.compareChartPoints[0].gpsTime.getTime()).toBe(base + 10000 + 7000)
    expect(result.compareChartPoints.at(-1).gpsTime.getTime()).toBe(base + 10000 + 33000)

    const entry = windowEntryValue(result.compareProcessedPoints, 2500, 'playerTime')
    expect(entry).toBeCloseTo(10)
    expect(windowEntryValue(result.compareProcessedPoints, 2500, 'distance')).toBeCloseTo(
      windowEntryValue(processedPoints, 2500, 'distance')
    )
  })

  test('returns null without a compare track or without a crossing', () => {
    expect(alignCompareTrack({ points: primary, comparePoints: [] })).toBeNull()
    expect(
      alignCompareTrack({
        points: primary,
        comparePoints: compare,
        chartPoints: primary,
        processedPoints,
        windowFrom: 5000,
        windowStartTime: base,
        windowEndTime: base + 1000
      })
    ).toBeNull()
  })
})
