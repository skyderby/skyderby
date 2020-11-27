import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

import { msToKmh } from 'utils/unitsConversion'

const calculateDistance = (first, second) => {
  const firstPosition = new LatLon(first.latitude, first.longitude)
  const secondPosition = new LatLon(second.latitude, second.longitude)

  return firstPosition.distanceTo(secondPosition)
}

export const calculateFlightProfile = (points, straightLine) => {
  if (points.length === 0) return []

  const firstPoint = points[0]
  let accumulatedDistance = 0

  return points.map((point, idx) => {
    const prevPoint = idx > 0 ? points[idx - 1] : firstPoint
    const distance = straightLine
      ? calculateDistance(point, firstPoint)
      : accumulatedDistance + calculateDistance(prevPoint, point)

    accumulatedDistance = distance

    return {
      x: distance,
      y: Math.round(Math.max(0, firstPoint.altitude - point.altitude)),
      hSpeed: Math.round(msToKmh(point.hSpeed)),
      vSpeed: Math.round(msToKmh(point.vSpeed))
    }
  })
}

export const calculateTerrainClearance = (points, measurements, straightLine) => {
  const flightProfile = calculateFlightProfile(points, straightLine)

  return flightProfile.map(({ x: distance, y: altitude }) => {
    const terrainElevation = getTerrainElevation(measurements, distance)

    if (terrainElevation === null) {
      return [distance, 120]
    }

    const distanceToTerrain = terrainElevation - altitude

    return [distance, Math.min(distanceToTerrain, 120)]
  })
}

const getTerrainElevation = (measurements, distance) => {
  if (!measurements) return null

  for (let idx = 0; idx < measurements.length - 1; idx++) {
    const { distance: prevDistance, altitude: prevAltitude } = measurements[idx]
    const { distance: nextDistance, altitude: nextAltitude } = measurements[idx + 1]

    if (prevDistance <= distance && nextDistance >= distance) {
      const altitudeDiff = nextAltitude - prevAltitude
      const coeff = (distance - prevDistance) / (nextDistance - prevDistance)

      return prevAltitude + altitudeDiff * coeff
    }
  }

  return null
}
