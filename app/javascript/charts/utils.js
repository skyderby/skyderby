export const findPositionForAltitude = (points, altitude) => {
  const idx = points.findIndex(point => point.altitude <= altitude)
  if (idx === -1) return null

  const firstPoint = points[idx]
  const secondPoint = points[idx + 1]

  if (!secondPoint) return firstPoint.flTime - points[0].flTime

  const flTime =
    firstPoint.flTime +
    ((secondPoint.flTime - firstPoint.flTime) /
      (firstPoint.altitude - secondPoint.altitude)) *
      (firstPoint.altitude - altitude)

  return flTime - points[0].flTime
}
