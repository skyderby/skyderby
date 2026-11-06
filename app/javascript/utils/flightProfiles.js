import { vincentyDistance } from './geo'
import { SYNC_VERTICAL_SPEED } from './tracks/jumpMarks'

const msToKmh = value => value * 3.6

const calculateDistance = (first, second) => vincentyDistance(first, second)

const getTerrainElevation = (measurements, distance) => {
  for (let idx = 0; idx < measurements.length - 1; idx++) {
    const prevRecord = measurements[idx]
    const nextRecord = measurements[idx + 1]

    if (!prevRecord || !nextRecord) continue

    const { distance: prevDistance, altitude: prevAltitude } = prevRecord
    const { distance: nextDistance, altitude: nextAltitude } = nextRecord

    if (prevDistance <= distance && nextDistance >= distance) {
      const altitudeDiff = nextAltitude - prevAltitude
      const coeff = (distance - prevDistance) / (nextDistance - prevDistance)

      return prevAltitude + altitudeDiff * coeff
    }
  }

  return null
}

const distanceToTerrainValue = value => {
  if (value < 1) return '<1'
  if (value > 120) return '>120'

  return Math.round(value)
}

const distanceToTerrainY = y => Math.max(1, Math.min(y, 120))

const syncFlTime = points => {
  const sync =
    points.find(point => msToKmh(point.vSpeed) >= SYNC_VERTICAL_SPEED) ?? points[0]
  return sync.flTime ?? 0
}

export const calculateFlightProfile = (points, straightLine) => {
  const firstPoint = points[0]
  if (!firstPoint) return []

  const syncTime = syncFlTime(points)

  let accumulatedDistance = 0

  return points.map((point, idx) => {
    const prevPoint = points[idx - 1] ?? firstPoint
    const distance = straightLine
      ? calculateDistance(point, firstPoint)
      : accumulatedDistance + calculateDistance(prevPoint, point)

    accumulatedDistance = distance

    return {
      x: distance,
      y: Math.round(Math.max(0, firstPoint.altitude - point.altitude)),
      custom: {
        time: (point.flTime ?? 0) - syncTime,
        fullSpeed: msToKmh(point.fullSpeed),
        hSpeed: msToKmh(point.hSpeed),
        vSpeed: msToKmh(point.vSpeed)
      }
    }
  })
}

export const calculateTerrainClearance = (points, measurements, straightLine) => {
  const flightProfile = calculateFlightProfile(points, straightLine)

  return flightProfile.map(({ x: distance, y: altitude }) => {
    const terrainElevation = getTerrainElevation(measurements, distance)

    if (terrainElevation === null) {
      return {
        x: distance,
        y: 120,
        custom: {
          presentation: '>120'
        }
      }
    }

    const distanceToTerrain = terrainElevation - altitude

    return {
      x: distance,
      y: distanceToTerrainY(distanceToTerrain),
      custom: {
        presentation: distanceToTerrainValue(distanceToTerrain)
      }
    }
  })
}
