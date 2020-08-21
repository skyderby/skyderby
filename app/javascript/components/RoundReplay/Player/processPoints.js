import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

function roundTime(time) {
  return Math.round(time / 100) / 10
}

function getTime(currentTime, startTime, endTime) {
  if (currentTime < startTime) return undefined
  if (currentTime > endTime) return roundTime(endTime - startTime)

  return roundTime(currentTime - startTime)
}

function distanceBetween(first, second) {
  const firstCoordinates = new LatLon(first.latitude, first.longitude)
  const secondCoordinates = new LatLon(second.latitude, second.longitude)

  return Math.round(firstCoordinates.distanceTo(secondCoordinates))
}

function getChartDistance(point, startPoint) {
  const gpsTime = Date.parse(point.gpsTime)
  const startTime = Date.parse(startPoint.gpsTime)

  if (gpsTime < startTime) return -distanceBetween(startPoint, point)

  return distanceBetween(startPoint, point)
}

function getDistance(point, startPoint, endPoint) {
  const gpsTime = Date.parse(point.gpsTime)
  const startTime = Date.parse(startPoint.gpsTime)
  const endTime = Date.parse(endPoint.gpsTime)

  if (gpsTime < startTime) return undefined
  if (gpsTime > endTime) return distanceBetween(startPoint, endPoint)

  return distanceBetween(startPoint, point)
}

function getSpeed(gpsTime, distance, time, endTime, result) {
  if (!distance || (time || 0) === 0) return undefined

  const speed = Math.round((distance / time) * 3.6)

  if (gpsTime > endTime) return result || speed

  return speed
}

function processPoints(
  discipline,
  rangeFrom,
  rangeTo,
  { id, points, startPoint, endPoint, result }
) {
  const startTime = Date.parse(startPoint.gpsTime)
  const endTime = Date.parse(endPoint.gpsTime)

  return points
    .map(el => {
      const gpsTime = Date.parse(el.gpsTime)
      const time = getTime(
        gpsTime,
        startTime,
        endTime,
        discipline === 'time' && Math.round(result * 10) / 10
      )
      const playerTime = roundTime(gpsTime - startTime)
      const distance = getDistance(
        el,
        startPoint,
        endPoint,
        discipline === 'distance' && Math.round(result)
      )
      const chartDistance = getChartDistance(el, startPoint)
      const speed = getSpeed(
        gpsTime,
        distance,
        time,
        endTime,
        discipline === 'speed' && Math.round(result)
      )

      return {
        id,
        playerTime,
        altitude: el.altitude,
        vSpeed: Math.round(el.vSpeed),
        chartDistance,
        gpsTime,
        startTime,
        endTime,
        time,
        distance,
        speed
      }
    })
    .filter(
      el => el.playerTime >= -5.1 && el.altitude > rangeTo - (rangeFrom - rangeTo) * 0.2
    )
}

export default processPoints
