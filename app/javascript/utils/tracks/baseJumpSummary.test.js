import { describe, test, expect } from 'vitest'

import { computeBaseJumpSummary } from './baseJumpSummary'

const EQUATORIAL_RADIUS = 6378137

// Straight eastbound flight along the equator, where one radian of longitude is
// exactly one equatorial radius, so horizontal distances are exact.
const point = (flTime, distance, altitude) => ({
  flTime,
  altitude,
  latitude: 0,
  longitude: (distance / EQUATORIAL_RADIUS) * (180 / Math.PI)
})

// Exit at 2 s from 1000 m, then a steep phase (30 m/s down, 10 m/s forward) up
// to 12 s, then a steady 3.2 glide (15 m/s down, 48 m/s forward).
const buildPoints = () => {
  const points = []

  for (let t = 0; t <= 2; t++) points.push(point(t, 0, 1000))
  for (let t = 3; t <= 12; t++) points.push(point(t, 10 * (t - 2), 1000 - 30 * (t - 2)))
  for (let t = 13; t <= 45; t++)
    points.push(point(t, 100 + 48 * (t - 12), 700 - 15 * (t - 12)))

  return points
}

const options = { exitFlTime: 2, deployFlTime: 40 }

const secondsIn = (buckets, index) => buckets[index].seconds

describe('computeBaseJumpSummary', () => {
  test('returns null for tracks without enough points', () => {
    expect(computeBaseJumpSummary([], options)).toBeNull()
    expect(computeBaseJumpSummary([point(0, 0, 1000)], options)).toBeNull()
  })

  test('reports the altitude lost when horizontal distance matches the drop', () => {
    const summary = computeBaseJumpSummary(buildPoints(), options)

    expect(summary.oneToOneDrop).toBeCloseTo(390.9, 0)
  })

  test('reports horizontal distance covered over the first 200 m of drop', () => {
    const summary = computeBaseJumpSummary(buildPoints(), options)

    expect(summary.referenceDrop).toBe(200)
    expect(summary.referenceDistance).toBeCloseTo(66.7, 0)
  })

  test('splits the first 200 m of drop into 50 m bands', () => {
    const { referenceBands } = computeBaseJumpSummary(buildPoints(), options)

    expect(referenceBands.map(band => [band.from, band.to])).toEqual([
      [0, 50],
      [50, 100],
      [100, 150],
      [150, 200]
    ])
    // the whole 200 m sits in the steep phase, a constant 1/3 glide
    referenceBands.forEach(band => expect(band.distance).toBeCloseTo(16.7, 0))
  })

  test('leaves bands past the end of the track empty', () => {
    const points = buildPoints().filter(point => point.altitude > 880)
    const { referenceBands } = computeBaseJumpSummary(points, options)

    expect(referenceBands[0].distance).toBeCloseTo(16.7, 0)
    expect(referenceBands[3].distance).toBeNull()
  })

  test('measures glide along the trajectory between the 10th second and deploy', () => {
    const summary = computeBaseJumpSummary(buildPoints(), options)

    expect(summary.glide.value).toBeCloseTo(3.2, 3)
  })

  test('measures full speed along the trajectory between the 10th second and deploy', () => {
    const summary = computeBaseJumpSummary(buildPoints(), options)

    expect(summary.speed.value).toBeCloseTo(181.04, 1)
  })

  test('buckets glide time against wingsuit bands', () => {
    const { glide } = computeBaseJumpSummary(buildPoints(), {
      ...options,
      wingsuit: true
    })

    expect(glide.buckets.map(bucket => [bucket.min, bucket.max])).toEqual([
      [3.5, null],
      [3, 3.5],
      [2.5, 3],
      [null, 2.5]
    ])
    expect(secondsIn(glide.buckets, 1)).toBeCloseTo(28)
    expect(secondsIn(glide.buckets, 0)).toBe(0)
  })

  test('buckets glide time against non-wingsuit bands', () => {
    const { glide } = computeBaseJumpSummary(buildPoints(), options)

    expect(glide.buckets.map(bucket => [bucket.min, bucket.max])).toEqual([
      [2, null],
      [1.5, 2],
      [1, 1.5],
      [null, 1]
    ])
    expect(secondsIn(glide.buckets, 0)).toBeCloseTo(28)
  })

  test('buckets time by full speed band', () => {
    const { speed } = computeBaseJumpSummary(buildPoints(), options)

    expect(speed.buckets.map(bucket => [bucket.min, bucket.max])).toEqual([
      [250, null],
      [200, 250],
      [150, 200],
      [null, 150]
    ])
    expect(secondsIn(speed.buckets, 2)).toBeCloseTo(28)
  })

  test('ignores the steep phase before the 10th second', () => {
    const summary = computeBaseJumpSummary(buildPoints(), options)
    const steepSeconds = summary.glide.buckets
      .slice(1)
      .reduce((total, bucket) => total + bucket.seconds, 0)

    expect(steepSeconds).toBe(0)
  })
})
