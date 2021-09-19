import { getTime } from 'date-fns'
import { PointRecord } from 'api/hooks/tracks/points'

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

const interpolateByAltitude = (
  first: PointRecord,
  second: PointRecord,
  altitude: number
): PointRecord => {
  const coeff = (first.altitude - altitude) / (first.altitude - second.altitude)

  const newPoint = { ...first, altitude }

  const numericFields: Array<keyof Omit<PointRecord, 'gpsTime'>> = [
    'flTime',
    'latitude',
    'longitude',
    'hSpeed',
    'vSpeed',
    'glideRatio'
  ]

  numericFields.forEach(key => {
    newPoint[key] = interpolateField(first, second, key, coeff)
  })

  newPoint.gpsTime = new Date(
    getTime(first.gpsTime) + (getTime(second.gpsTime) - getTime(first.gpsTime)) * coeff
  )

  return newPoint
}

const interpolateField = (
  first: PointRecord,
  second: PointRecord,
  key: keyof Omit<PointRecord, 'gpsTime'>,
  coeff: number
): number => {
  return first[key] + (second[key] - first[key]) * coeff
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
