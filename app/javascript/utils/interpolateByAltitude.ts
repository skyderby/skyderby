import { PointRecord } from 'api/tracks/points'
import { getTime } from 'date-fns'

const interpolateField = (first: number, second: number, coeff: number): number =>
  first + (second - first) * coeff

const interpolateByAltitude = (
  first: PointRecord,
  second: PointRecord,
  altitude: number
): PointRecord => {
  const coeff = (first.altitude - altitude) / (first.altitude - second.altitude)

  const newPoint = { ...first, altitude }

  const numericFields: Array<keyof Omit<PointRecord, 'gpsTime'>> = [
    'absAltitude',
    'flTime',
    'latitude',
    'longitude',
    'hSpeed',
    'vSpeed',
    'glideRatio',
    'speedAccuracy',
    'verticalAccuracy'
  ]

  numericFields.forEach(key => {
    newPoint[key] = interpolateField(first[key], second[key], coeff)
  })

  newPoint.gpsTime = new Date(
    getTime(first.gpsTime) + (getTime(second.gpsTime) - getTime(first.gpsTime)) * coeff
  )

  return newPoint
}

export default interpolateByAltitude
