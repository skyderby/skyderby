import { differenceInMilliseconds, isEqual, parseISO } from 'date-fns'

const validationWindowHeight = 1000

export const findPositionForAltitude = (points, altitude) => {
  const idx = points.findIndex(point => point.altitude <= altitude)
  const firstPoint = points[idx]
  const secondPoint = points[idx + 1]

  const flTime =
    firstPoint.flTime +
    ((secondPoint.flTime - firstPoint.flTime) /
      (firstPoint.altitude - secondPoint.altitude)) *
      (firstPoint.altitude - altitude)

  return flTime - points[0].flTime
}

export const findPlotbandPosition = (firstPoint, windowStart, windowEnd) => {
  const windowStartTime = parseISO(windowStart)
  const windowEndTime = parseISO(windowEnd)

  return {
    from: differenceInMilliseconds(windowStartTime, firstPoint.gpsTime) / 1000,
    to: differenceInMilliseconds(windowEndTime, firstPoint.gpsTime) / 1000
  }
}

export const buildAccuracySeries = (points, windowEndAltitude) => {
  const validationWindowStart = windowEndAltitude + validationWindowHeight

  const data = points
    .filter(
      point =>
        point.altitude <= validationWindowStart && point.altitude >= windowEndAltitude
    )
    .map(point => [point.flTime - points[0].flTime, point.verticalAccuracy])

  return {
    name: 'Vertical Accuracy',
    type: 'column',
    yAxis: 3,
    zones: [
      { value: 0, color: '#ccc' },
      { value: 3.25, color: '#ccc' },
      { color: 'red' }
    ],
    data
  }
}

export const findResultWindow = (points, windowStartTime, windowEndTime) => {
  const startTime = parseISO(windowStartTime)
  const endTime = parseISO(windowEndTime)

  return points
    .filter(point => isEqual(point.gpsTime, startTime) || isEqual(point.gpsTime, endTime))
    .map(point => Math.round(point.altitude))
}
