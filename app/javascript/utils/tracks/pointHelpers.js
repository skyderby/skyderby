import { haversineDistance, calculateBearing, segmentIntersection } from '../geo'

export { EARTH_MEAN_RADIUS, haversineDistance, calculateBearing } from '../geo'

export const timeOf = point => {
  const time = point.gpsTime
  return time instanceof Date ? time.getTime() : new Date(time).getTime()
}

export const lerp = (a, b, fraction) => a + (b - a) * fraction

const lerpPoint = (curr, next, fraction, keys) => {
  const point = {}
  keys.forEach(key => {
    point[key] = lerp(curr[key] ?? 0, next[key] ?? 0, fraction)
  })
  return point
}

export const POSITION_KEYS = ['latitude', 'longitude', 'altitude']
export const INDICATOR_KEYS = ['altitude', 'fullSpeed', 'hSpeed', 'vSpeed', 'glideRatio']

export const interpolateAtIndex = (points, index, fraction, keys = INDICATOR_KEYS) => {
  const curr = points[index]
  const next = points[Math.min(index + 1, points.length - 1)]
  if (!curr || !next) return null

  return lerpPoint(curr, next, fraction, keys)
}

export const timeAtIndex = (points, index, fraction = 0) => {
  const curr = points[index]
  const next = points[Math.min(index + 1, points.length - 1)]
  return lerp(timeOf(curr), timeOf(next), fraction)
}

export const indexAtTime = (points, targetTime) => {
  for (let i = 0; i < points.length - 1; i++) {
    const currTime = timeOf(points[i])
    const nextTime = timeOf(points[i + 1])

    if (targetTime >= currTime && targetTime < nextTime) {
      return { index: i, fraction: (targetTime - currTime) / (nextTime - currTime) }
    }
  }

  return { index: points.length - 1, fraction: 0 }
}

export const futureIndexFrom = (points, fromIndex, milliseconds) => {
  const targetTime = timeOf(points[fromIndex]) + milliseconds

  for (let i = fromIndex + 1; i < points.length; i++) {
    if (timeOf(points[i]) >= targetTime) return i
  }

  return null
}

export const targetIndexFrom = (points, fromIndex, milliseconds = 3000) =>
  futureIndexFrom(points, fromIndex, milliseconds) ?? points.length - 1

export const headingAtIndex = (points, index, fraction = 0) => {
  const from = interpolateAtIndex(points, index, fraction, POSITION_KEYS)
  const to = points[targetIndexFrom(points, index)]
  return { point: from, heading: calculateBearing(from, to) }
}

export const nearestIndexByTime = (points, targetTime) => {
  let bestIndex = 0
  let bestDiff = Infinity

  points.forEach((point, index) => {
    const diff = Math.abs(timeOf(point) - targetTime)
    if (diff < bestDiff) {
      bestDiff = diff
      bestIndex = index
    }
  })

  return bestIndex
}

export const nearestPointTo = (points, target) => {
  let best = null
  let bestDistance = Infinity

  points.forEach(point => {
    const distance = haversineDistance(target, point)
    if (distance < bestDistance) {
      bestDistance = distance
      best = point
    }
  })

  return best
}

export const altitudeCrossing = (points, altitude, { descendingOnly = true } = {}) => {
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]

    const descending = curr.altitude >= altitude && next.altitude < altitude
    const ascending =
      !descendingOnly && curr.altitude <= altitude && next.altitude > altitude

    if (descending || ascending) {
      if (curr.altitude === altitude) return { index: i, fraction: 0 }
      if (next.altitude === altitude) return { index: i + 1, fraction: 0 }

      const fraction = (altitude - curr.altitude) / (next.altitude - curr.altitude)
      return { index: i, fraction }
    }
  }

  return null
}

export const valueAtCrossing = (points, crossing, key) => {
  if (!crossing) return null
  const curr = points[crossing.index]
  const next = points[Math.min(crossing.index + 1, points.length - 1)]
  return lerp(curr[key], next[key], crossing.fraction)
}

export const interpolatePointByAltitude = (points, altitude) => {
  if (!points || points.length === 0) return null

  const crossing = altitudeCrossing(points, altitude, { descendingOnly: false })
  if (!crossing) return null

  const curr = points[crossing.index]
  if (crossing.fraction === 0) return curr
  const next = points[crossing.index + 1]

  return {
    ...lerpPoint(curr, next, crossing.fraction, ['latitude', 'longitude']),
    altitude,
    gpsTime: new Date(lerp(timeOf(curr), timeOf(next), crossing.fraction))
  }
}

export const interpolatePointByTime = (points, targetTime) => {
  if (!points || points.length === 0) return null

  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    const currTime = timeOf(curr)
    const nextTime = timeOf(next)

    const within =
      (currTime <= targetTime && nextTime >= targetTime) ||
      (currTime >= targetTime && nextTime <= targetTime)
    if (!within) continue

    if (currTime === targetTime) return curr
    if (nextTime === targetTime) return next

    const fraction = (targetTime - currTime) / (nextTime - currTime)
    return {
      ...lerpPoint(curr, next, fraction, POSITION_KEYS),
      gpsTime: new Date(targetTime)
    }
  }

  return null
}

export const findLineCrossing = (points, line) => {
  if (!line) return null

  for (let i = 1; i < points.length; i++) {
    const intersection = segmentIntersection(
      points[i - 1],
      points[i],
      line.start,
      line.end
    )
    if (intersection) {
      return {
        index: i,
        fraction: intersection.fraction,
        latitude: intersection.latitude,
        longitude: intersection.longitude
      }
    }
  }

  return null
}

export const indexAtPlayerTime = (points, playerTime) => {
  if (playerTime < points[0].playerTime) return { index: 0, fraction: 0 }

  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i].playerTime
    const next = points[i + 1].playerTime
    if (playerTime >= curr && playerTime < next) {
      return { index: i, fraction: (playerTime - curr) / (next - curr) }
    }
  }

  return { index: points.length - 1, fraction: 0 }
}

export const closestIndexByPlayerTime = (points, playerTime) => {
  let closestIndex = 0
  let minDiff = Infinity

  points.forEach((point, index) => {
    const diff = Math.abs(point.playerTime - playerTime)
    if (diff < minDiff) {
      minDiff = diff
      closestIndex = index
    }
  })

  return closestIndex
}

export const interpolateByPlayerTime = (points, targetTime) => {
  if (!points || points.length === 0) return null

  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]

    if (targetTime >= curr.playerTime && targetTime < next.playerTime) {
      const fraction =
        (targetTime - curr.playerTime) / (next.playerTime - curr.playerTime)
      return lerpPoint(curr, next, fraction, [...INDICATOR_KEYS, 'distance'])
    }
  }

  if (targetTime < points[0].playerTime) {
    return points[0]
  }

  return points[points.length - 1]
}
