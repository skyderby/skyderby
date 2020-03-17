import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

import { msToKmh } from 'utils/unitsConversion'

const calculateDistance = (first, second) => {
  const firstPosition = new LatLon(first.latitude, first.longitude)
  const secondPosition = new LatLon(second.latitude, second.longitude)

  return firstPosition.distanceTo(secondPosition)
}

export const calculateFlightProfile = points => {
  if (points.length === 0) return

  const firstPoint = points[0]

  return points.map(point => ({
    x: calculateDistance(point, firstPoint),
    y: Math.round(Math.max(0, firstPoint.altitude - point.altitude)),
    hSpeed: Math.round(msToKmh(point.hSpeed)),
    vSpeed: Math.round(msToKmh(point.vSpeed))
  }))
}
