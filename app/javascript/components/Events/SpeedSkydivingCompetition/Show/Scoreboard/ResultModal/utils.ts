import { differenceInMilliseconds, isEqual } from 'date-fns'
import type { SeriesOptionsType } from 'highcharts'
import { PointRecord } from 'api/tracks/points'
import { Result } from 'api/speedSkydivingCompetitions'

const validationWindowHeight = 1000

export const findPositionForAltitude = (
  points: PointRecord[],
  altitude: number
): number | null => {
  const idx = points.findIndex(point => point.altitude <= altitude)
  if (idx === -1) return null

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
  result: Result
): { from: number; to: number } => {
  const { windowStartTime, windowEndTime } = result

  return {
    from: differenceInMilliseconds(windowStartTime, firstPoint.gpsTime) / 1000,
    to: differenceInMilliseconds(windowEndTime, firstPoint.gpsTime) / 1000
  }
}

export const buildAccuracySeries = (
  points: PointRecord[],
  windowEndAltitude: number
): SeriesOptionsType => {
  const validationWindowStart = windowEndAltitude + validationWindowHeight

  const data = points
    .filter(
      point =>
        point.altitude <= validationWindowStart && point.altitude >= windowEndAltitude
    )
    .map(point => [
      point.flTime - points[0].flTime,
      (Math.sqrt(2) * point.verticalAccuracy) / 3
    ])

  return {
    name: 'Speed Accuracy',
    type: 'column',
    yAxis: 2,
    zones: [{ value: 0, color: '#ccc' }, { value: 3, color: '#ccc' }, { color: 'red' }],
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
