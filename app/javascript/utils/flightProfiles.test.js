import { describe, expect, it } from 'vitest'
import { calculateFlightProfile } from './flightProfiles'

const point = (flTime, vSpeed, altitude) => ({
  flTime,
  altitude,
  latitude: 61.1,
  longitude: 7.1,
  hSpeed: 0,
  vSpeed,
  fullSpeed: vSpeed
})

describe('calculateFlightProfile', () => {
  it('counts time from the first point reaching 10 km/h vertical speed', () => {
    const profile = calculateFlightProfile(
      [point(0, 0, 1000), point(1, 1, 1000), point(2, 3, 998), point(3, 8, 990)],
      false
    )

    expect(profile.map(sample => sample.custom.time)).toEqual([-2, -1, 0, 1])
    expect(profile[0].y).toBe(0)
  })

  it('falls back to the first point when the track never reaches 10 km/h', () => {
    const profile = calculateFlightProfile([point(5, 0, 1000), point(6, 1, 999)], false)

    expect(profile.map(sample => sample.custom.time)).toEqual([0, 1])
  })
})
