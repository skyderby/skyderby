const GLIDE_ONE_HOLD = 3

const SYNC_VERTICAL_SPEED = 10

const glideOf = point => (point.vSpeed > 0 ? point.hSpeed / point.vSpeed : Infinity)

export const findGlideOneIndex = (
  points,
  { fromFlTime = null, toFlTime = null } = {}
) => {
  const start = points.findIndex(
    point =>
      (fromFlTime === null || point.flTime >= fromFlTime) &&
      point.vSpeed >= SYNC_VERTICAL_SPEED
  )
  if (start < 0) return null

  let streak = null

  for (let i = start; i < points.length; i++) {
    const point = points[i]
    if (toFlTime !== null && point.flTime > toFlTime) break

    if (glideOf(point) <= 1) {
      streak = null
      continue
    }

    streak ??= i
    if (point.flTime - points[streak].flTime >= GLIDE_ONE_HOLD) return streak
  }

  return null
}

export const maxFlareGain = points => {
  let gain = 0
  let best = 0

  for (let i = 1; i < points.length; i++) {
    const delta = points[i].altitude - points[i - 1].altitude
    gain += points[i].vSpeed < 0 ? delta : -Math.abs(delta)
    if (gain < 0) gain = 0
    if (gain > best) best = gain
  }

  return best >= 1 ? best : null
}
