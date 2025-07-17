export function interpolatePointByAltitude(points, targetAltitude) {
  if (!points || points.length === 0) return null

  for (let i = 0; i < points.length - 1; i++) {
    const currentPoint = points[i]
    const nextPoint = points[i + 1]

    const isWithinRange =
      (currentPoint.altitude >= targetAltitude && nextPoint.altitude <= targetAltitude) ||
      (currentPoint.altitude <= targetAltitude && nextPoint.altitude >= targetAltitude)

    if (isWithinRange) {
      if (currentPoint.altitude === targetAltitude) return currentPoint
      if (nextPoint.altitude === targetAltitude) return nextPoint

      const altitudeDiff = nextPoint.altitude - currentPoint.altitude
      const ratio = (targetAltitude - currentPoint.altitude) / altitudeDiff

      return {
        latitude:
          currentPoint.latitude + (nextPoint.latitude - currentPoint.latitude) * ratio,
        longitude:
          currentPoint.longitude +
          (nextPoint.longitude - currentPoint.longitude) * ratio,
        altitude: targetAltitude,
        gpsTime: new Date(
          currentPoint.gpsTime.getTime() +
            (nextPoint.gpsTime.getTime() - currentPoint.gpsTime.getTime()) * ratio
        )
      }
    }
  }

  return null
}

export function interpolatePointByTime(points, targetTime) {
  for (let i = 0; i < points.length - 1; i++) {
    const currentPoint = points[i]
    const nextPoint = points[i + 1]

    const currentTime = new Date(currentPoint.gpsTime).getTime()
    const nextTime = new Date(nextPoint.gpsTime).getTime()

    const isWithinRange =
      (currentTime <= targetTime && nextTime >= targetTime) ||
      (currentTime >= targetTime && nextTime <= targetTime)

    if (isWithinRange) {
      if (currentTime === targetTime) return currentPoint
      if (nextTime === targetTime) return nextPoint

      const ratio = (targetTime - currentTime) / (nextTime - currentTime)

      return {
        latitude:
          currentPoint.latitude + (nextPoint.latitude - currentPoint.latitude) * ratio,
        longitude:
          currentPoint.longitude +
          (nextPoint.longitude - currentPoint.longitude) * ratio,
        altitude:
          currentPoint.altitude + (nextPoint.altitude - currentPoint.altitude) * ratio,
        gpsTime: new Date(targetTime)
      }
    }
  }

  return null
}

export function findDeployPoint(points, deployFlTime) {
  if (!deployFlTime || !points || points.length === 0) return null

  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].flTime <= deployFlTime) {
      return points[i]
    }
  }

  return null
}