import { PointRecord } from 'api/tracks/points'

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
