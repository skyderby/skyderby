import {
  interpolateAtIndex,
  interpolateByPlayerTime,
  futureIndexFrom,
  timeAtIndex,
  timeOf
} from '../pointHelpers'

const KMH_TO_MS = 1 / 3.6

export const accelerationBetween = (current, future, deltaSeconds) => {
  if (!current || !future || !deltaSeconds) return null

  const accel = key => ((future[key] - current[key]) * KMH_TO_MS) / deltaSeconds

  return {
    fullSpeedAccel: accel('fullSpeed'),
    hSpeedAccel: accel('hSpeed'),
    vSpeedAccel: accel('vSpeed')
  }
}

export const accelerationAt = (points, index, fraction = 0, lookaheadMs = 1000) => {
  const futureIndex = futureIndexFrom(points, index, lookaheadMs)
  if (futureIndex === null) return null

  const current = interpolateAtIndex(points, index, fraction)
  const future = points[futureIndex]
  const deltaSeconds = (timeOf(future) - timeAtIndex(points, index, fraction)) / 1000

  return accelerationBetween(current, future, deltaSeconds)
}

export const accelerationAtPlayerTime = (points, playerTime, lookaheadSeconds = 1) =>
  accelerationBetween(
    interpolateByPlayerTime(points, playerTime),
    interpolateByPlayerTime(points, playerTime + lookaheadSeconds),
    lookaheadSeconds
  )
