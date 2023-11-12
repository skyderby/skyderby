import { useMemo } from 'react'
import isEqual from 'date-fns/isEqual'
import addSeconds from 'date-fns/addSeconds'

import { PerformanceCompetition, Result } from 'api/performanceCompetitions'
import { PointRecord, pointsQuery, useTrackPointsQuery } from 'api/tracks/points'

import interpolateByAltitude from 'utils/interpolateByAltitude'
import { QueryClient } from '@tanstack/react-query'

const getPointsAround = <TPoint>(
  points: TPoint[],
  predicate: (a: TPoint, b: TPoint) => boolean
) => {
  for (let idx = 0; idx < points.length; idx++) {
    if (idx === 0) continue

    const first = points[idx - 1]
    const second = points[idx]

    if (!first || !second) continue

    if (predicate(first, second)) return [first, second]
  }

  return null
}

const getPointForAltitude = (points: PointRecord[], altitude: number) => {
  const [first, second] =
    getPointsAround(
      points,
      (first, second) => first.altitude >= altitude && altitude >= second.altitude
    ) ?? []

  if (!first || !second) return null

  return interpolateByAltitude(first, second, altitude)
}

const fetchResultPoints = async (
  queryClient: QueryClient,
  event: PerformanceCompetition,
  result: Result
) => {
  const points = await queryClient.fetchQuery(
    pointsQuery(result.trackId, {
      trimmed: { secondsBeforeStart: 7 },
      originalFrequency: true
    })
  )

  const afterExitPoint = points.find(point =>
    isEqual(point.gpsTime, addSeconds(result.exitedAt, 10))
  )

  const startPoint = getPointForAltitude(points, event.rangeFrom)
  const endPoint = getPointForAltitude(points, event.rangeTo)

  return { points, afterExitPoint, startPoint, endPoint }
}

const useResultPoints = (
  event: PerformanceCompetition,
  result: Result,
  queryOptions: Omit<
    Parameters<typeof useTrackPointsQuery>[2],
    'queryKey' | 'queryFn'
  > = {}
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

export { fetchResultPoints }
export default useResultPoints
