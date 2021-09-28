import { differenceInMilliseconds, isEqual } from 'date-fns'
import { PointRecord } from 'api/hooks/tracks/points'

const validationWindowHeight = 1000

export const findPositionForAltitude = (
  points: PointRecord[],
  altitude: number
): number => {
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

export const findPlotbandPosition = (
  firstPoint: PointRecord,
  windowStartTime: Date,
  windowEndTime: Date
): { from: number; to: number } => {
  return {
    from: differenceInMilliseconds(windowStartTime, firstPoint.gpsTime) / 1000,
    to: differenceInMilliseconds(windowEndTime, firstPoint.gpsTime) / 1000
  }
}

export const buildAccuracySeries = (points: PointRecord[], windowEndAltitude: number) => {
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

export const findResultWindow = (
  points: PointRecord[],
  windowStartTime: Date,
  windowEndTime: Date
): number[] =>
  points
    .filter(
      point =>
        isEqual(point.gpsTime, windowStartTime) || isEqual(point.gpsTime, windowEndTime)
    )
    .map(point => Math.round(point.altitude))
