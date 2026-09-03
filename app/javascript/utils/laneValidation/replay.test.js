import { describe, test, expect } from 'vitest'
import {
  prepareJumps,
  timelineRange,
  positionsAt,
  pairDistances,
  formatElapsed
} from './replay'

const base = new Date('2026-07-28T02:38:00Z').getTime()

const buildPoints = ({ latitude, longitude, altitude, seconds, latStep = 0.0005 }) =>
  Array.from({ length: seconds + 1 }, (_, i) => ({
    gpsTime: new Date(base + i * 1000),
    flTime: i,
    latitude: latitude + latStep * i,
    longitude,
    altitude: altitude - 50 * i
  }))

const first = {
  id: '1',
  exitedAt: new Date(base + 2000).toISOString(),
  deployFlTime: 20,
  points: buildPoints({ latitude: 45, longitude: 30, altitude: 3000, seconds: 30 })
}

const second = {
  id: '2',
  exitedAt: new Date(base + 5000).toISOString(),
  deployFlTime: 25,
  points: buildPoints({ latitude: 45.001, longitude: 30, altitude: 2950, seconds: 30 })
}

const jumps = prepareJumps([first, second])

describe('prepareJumps', () => {
  test('derives exit and deploy times and drops empty tracks', () => {
    expect(jumps.map(jump => [jump.exitTime, jump.deployTime])).toEqual([
      [base + 2000, base + 20000],
      [base + 5000, base + 25000]
    ])
    expect(prepareJumps([{ id: '4', points: [] }])).toEqual([])
  })

  test('falls back to track bounds without exit and deploy', () => {
    const [jump] = prepareJumps([{ id: '3', points: first.points }])
    expect([jump.exitTime, jump.deployTime]).toEqual([base, base + 30000])
  })
})

describe('timelineRange', () => {
  test('spans from earliest exit to latest deploy', () => {
    expect(timelineRange(jumps)).toEqual({ start: base + 2000, end: base + 25000 })
  })

  test('returns null when nothing is loaded', () => {
    expect(timelineRange([])).toBeNull()
  })
})

describe('positionsAt', () => {
  test('interpolates each jump and derives heading from the next second', () => {
    const positions = positionsAt(jumps, base + 10500)

    expect(positions).toHaveLength(2)
    expect(positions[0].point.altitude).toBe(2475)
    expect(positions[0].point.latitude).toBeCloseTo(45.00525, 6)
    expect(positions[0].heading).toBeCloseTo(0, 3)
    expect(positions.map(position => position.freefall)).toEqual([true, true])
  })

  test('hides jumps before their exit', () => {
    const positions = positionsAt(jumps, base + 3000)

    expect(positions.map(({ jump }) => jump.id)).toEqual(['1'])
  })

  test('keeps a deployed jump visible but not in freefall', () => {
    const positions = positionsAt(jumps, base + 22000)

    expect(positions.map(({ jump, freefall }) => [jump.id, freefall])).toEqual([
      ['1', false],
      ['2', true]
    ])
  })

  test('skips jumps without a point at that time', () => {
    expect(positionsAt(jumps, base + 60000)).toHaveLength(0)
  })
})

describe('pairDistances', () => {
  test('reports pairs closer than the line threshold', () => {
    const pairs = pairDistances(positionsAt(jumps, base + 10000))

    expect(pairs).toHaveLength(1)
    expect(pairs[0].distance).toBeCloseTo(122, 0)
  })

  test('ignores pairs farther than the threshold', () => {
    const far = prepareJumps([
      {
        id: '5',
        points: buildPoints({
          latitude: 45.005,
          longitude: 30,
          altitude: 3000,
          seconds: 30
        })
      }
    ])

    expect(pairDistances(positionsAt([jumps[0], ...far], base + 10000))).toHaveLength(0)
  })

  test('pairs a freefall jump with a deployed one', () => {
    expect(pairDistances(positionsAt(jumps, base + 22000))).toHaveLength(1)
  })

  test('ignores pairs where both have deployed', () => {
    expect(pairDistances(positionsAt(jumps, base + 26000))).toHaveLength(0)
  })
})

describe('formatElapsed', () => {
  test('formats minutes and tenths of a second', () => {
    expect(formatElapsed(0)).toBe('0:00.0')
    expect(formatElapsed(72400)).toBe('1:12.4')
  })

  test('carries rounding into the minute', () => {
    expect(formatElapsed(59950)).toBe('1:00.0')
    expect(formatElapsed(119990)).toBe('2:00.0')
  })
})
