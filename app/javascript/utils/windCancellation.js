import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

import {
  vectorFromMagnitudeAndDirection,
  sumVectors,
  getMagnitude,
  getDirection
} from 'utils/vectors'

const interpolateByAltitude = ([first, second], altitude) => {
  const interpolationFactor =
    (altitude - first.altitude) / (second.altitude - first.altitude)

  return {
    windSpeed:
      first.windSpeed + (second.windSpeed - first.windSpeed) * interpolationFactor,
    windDirection:
      first.windDirection +
      (second.windDirection - first.windDirection) * interpolationFactor
  }
}

export const getWindEffect = (windData, altitude) => {
  const firstRecord = windData[0]
  const lastRecord = windData[windData.length - 1]

  if (altitude <= firstRecord.altitude) return firstRecord.altitude
  if (altitude >= lastRecord.altitude) return lastRecord.altitude

  const index = windData.findIndex(el => el.altitude >= altitude)

  return interpolateByAltitude([windData[index - 1], windData[index]], altitude)
}

export const subtractWind = (points = [], windData = []) => {
  if (points.length === 0 || windData.length === 0) return []

  const sortedData = windData.sort((a, b) => a.altitude - b.altitude)

  let accumulatedWindEffect = [0, 0]

  return points.map((point, idx) => {
    if (idx === 0) return point

    const windEffect = getWindEffect(sortedData, point.altitude)

    const prevPoint = points[idx - 1]
    const timeDiff = (point.gpsTime - prevPoint.gpsTime) / 1000

    accumulatedWindEffect = sumVectors(
      accumulatedWindEffect,
      vectorFromMagnitudeAndDirection(
        windEffect.windSpeed * timeDiff,
        windEffect.windDirection
      )
    )

    const prevPosition = new LatLon(prevPoint.latitude, prevPoint.longitude)
    const currentPosition = new LatLon(point.latitude, point.longitude)
    const newPosition = currentPosition.destinationPoint(
      getMagnitude(accumulatedWindEffect),
      getDirection(accumulatedWindEffect)
    )

    const hSpeed = prevPosition.distanceTo(newPosition) / timeDiff
    const glideRatio = hSpeed / point.vSpeed !== 0 ? point.vSpeed : 0.1

    return {
      ...point,
      latitude: newPosition.latitude,
      longitude: newPosition.longitude,
      hSpeed,
      glideRatio
    }
  })
}
