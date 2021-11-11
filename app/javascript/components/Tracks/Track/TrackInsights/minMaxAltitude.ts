import { PointRecord } from 'api/tracks/points'

export const getMinMaxAltitude = (points: PointRecord[]): readonly number[] => {
  if (points.length < 1) return []

  const altitudeValues = points.map(el => el.altitude).sort((a, b) => a - b)

  return [altitudeValues[0], altitudeValues[altitudeValues.length - 1]]
}
