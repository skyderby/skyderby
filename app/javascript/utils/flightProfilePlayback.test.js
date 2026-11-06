import { describe, expect, it } from 'vitest'
import {
  layoutLabels,
  playbackStateAt,
  positionAt,
  profileDuration
} from './flightProfilePlayback'

const point = (time, x, y, hSpeed, vSpeed) => ({
  x,
  y,
  custom: { time, hSpeed, vSpeed, fullSpeed: Math.hypot(hSpeed, vSpeed) }
})

const profile = [point(0, 0, 0, 0, 0), point(1, 10, 20, 36, 72), point(2, 30, 40, 72, 72)]

describe('positionAt', () => {
  it('interpolates between samples by time', () => {
    const position = positionAt(profile, 1.5)

    expect(position.x).toBeCloseTo(20)
    expect(position.y).toBeCloseTo(30)
    expect(position.hSpeed).toBeCloseTo(54)
    expect(position.fullSpeed).toBeCloseTo(Math.hypot(54, 72))
  })

  it('returns null once the data has ended', () => {
    expect(profileDuration(profile)).toBe(2)
    expect(positionAt(profile, 2.01)).toBeNull()
    expect(positionAt([], 0)).toBeNull()
  })
})

describe('playbackStateAt', () => {
  it('adds acceleration from a one second lookahead', () => {
    const state = playbackStateAt(profile, 1)

    expect(state.acceleration.hSpeedAccel).toBeCloseTo(10)
    expect(state.acceleration.vSpeedAccel).toBeCloseTo(0)
  })

  it('has no acceleration without lookahead data', () => {
    expect(playbackStateAt(profile, 1.5).acceleration).toBeNull()
  })
})

describe('layoutLabels', () => {
  it('pushes overlapping labels apart and keeps them inside the plot', () => {
    const items = layoutLabels(
      [
        { px: 100, py: 50, width: 80, height: 30 },
        { px: 105, py: 52, width: 80, height: 30 },
        { px: 380, py: 195, width: 80, height: 30 }
      ],
      400,
      200
    )

    const [first, second, third] = items
    expect(Math.abs(first.top - second.top)).toBeGreaterThanOrEqual(30)
    expect(third.left + third.width).toBeLessThanOrEqual(400)
    expect(third.left).toBeLessThan(380)
    expect(third.top + third.height).toBeLessThanOrEqual(200)
  })
})
