import { useMemo } from 'react'
import isEqual from 'date-fns/isEqual'
import addSeconds from 'date-fns/addSeconds'

import { PerformanceCompetition, Result } from 'api/performanceCompetitions'
import { PointRecord, useTrackPointsQuery } from 'api/tracks/points'

import getPointsAround from 'utils/getPointsAround'
import interpolateByAltitude from 'utils/interpolateByAltitude'

const getPointForAltitude = (points: PointRecord[], altitude: number) => {
  const [first, second] =
    getPointsAround(
      points,
      (first, second) => first.altitude >= altitude && altitude >= second.altitude
    ) ?? []

  if (!first || !second) return null

  return interpolateByAltitude(first, second, altitude)
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

  const afterExitPoint = useMemo(
    () => points.find(point => isEqual(point.gpsTime, addSeconds(result.exitedAt, 10))),
    [result, points]
  )

  const startPoint = useMemo(() => getPointForAltitude(points, event.rangeFrom), [
    points,
    event.rangeFrom
  ])
  const endPoint = useMemo(() => getPointForAltitude(points, event.rangeTo), [
    points,
    event.rangeTo
  ])

  return { points, afterExitPoint, startPoint, endPoint, isLoading }
}

export default useResultPoints
