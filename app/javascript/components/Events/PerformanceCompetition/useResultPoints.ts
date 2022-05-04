import isEqual from 'date-fns/isEqual'
import addSeconds from 'date-fns/addSeconds'

import { PerformanceCompetition, Result } from 'api/performanceCompetitions'
import { PointRecord, useTrackPointsQuery } from 'api/tracks/points'

import getPointsAround from 'utils/getPointsAround'

const interpolateValue = (first: number, second: number, factor: number): number =>
  first + (second - first) * factor

const getPointForAltitude = (points: PointRecord[], altitude: number) => {
  const [first, second] =
    getPointsAround(
      points,
      (first, second) => first.altitude >= altitude && altitude >= second.altitude
    ) ?? []

  if (!first || !second) return null

  const interpolationFactor =
    (first.altitude - altitude) / (first.altitude - second.altitude)

  return {
    altitude: interpolateValue(first.altitude, second.altitude, interpolationFactor),
    latitude: interpolateValue(first.latitude, second.latitude, interpolationFactor),
    longitude: interpolateValue(first.longitude, second.longitude, interpolationFactor)
  }
}

const useResultPoints = (
  event: PerformanceCompetition,
  result: Result,
  queryOptions: Parameters<typeof useTrackPointsQuery>[2] = {}
) => {
  const { data: points = [], isLoading } = useTrackPointsQuery(
    result.trackId,
    { trimmed: { secondsBeforeStart: 7 }, originalFrequency: true },
    queryOptions
  )

  const afterExitPoint = points.find(point =>
    isEqual(point.gpsTime, addSeconds(result.exitedAt, 10))
  )

  const startPoint = getPointForAltitude(points, event.rangeFrom)
  const endPoint = getPointForAltitude(points, event.rangeTo)

  return { points, afterExitPoint, startPoint, endPoint, isLoading }
}

export default useResultPoints
