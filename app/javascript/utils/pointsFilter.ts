import { PointRecord } from 'api/tracks/points'
import interpolateByAltitude from 'utils/interpolateByAltitude'

const findStartIndex = (points: PointRecord[], fromAltitude: number): number => {
  if (fromAltitude === undefined) return 0

  return Math.max(
    points.findIndex(el => el.altitude <= fromAltitude),
    0
  )
}

const findEndIndex = (
  points: PointRecord[],
  startPoint: PointRecord,
  toAltitude: number
): number => {
  const lastIdx = points.length - 1

  if (toAltitude === undefined) return lastIdx

  const idx = points.findIndex(
    el => el.altitude <= toAltitude && el.gpsTime > startPoint.gpsTime
  )

  return idx > -1 ? idx : lastIdx
}

export const cropPoints = (
  points: PointRecord[] = [],
  fromAltitude: number,
  toAltitude: number
): PointRecord[] => {
  if (points.length <= 1) return points

  const startIndex = findStartIndex(points, fromAltitude)
  const startPoint = points[startIndex]

  const endIndex = findEndIndex(points, startPoint, toAltitude)
  const endPoint = points[endIndex]

  const pointsToPrepend =
    startIndex === 0 || startPoint.altitude === fromAltitude
      ? []
      : [interpolateByAltitude(points[startIndex - 1], startPoint, fromAltitude)]

  const pointsToAppend =
    !toAltitude || endPoint.altitude === toAltitude
      ? [points[endIndex]]
      : [interpolateByAltitude(points[endIndex - 1], endPoint, toAltitude)]

  return [...pointsToPrepend, ...points.slice(startIndex, endIndex), ...pointsToAppend]
}
