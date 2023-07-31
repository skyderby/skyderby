import { PointRecord } from 'api/tracks/points'
import interpolateByAltitude from 'utils/interpolateByAltitude'

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

export default getPointForAltitude
