import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

export const calculateCumulativeDistance = (
  points,
  { straightLine = false, rangeStartPosition = 0 } = {}
) => {
  if (points.length === 0) return []

  const firstPointTime = points[0].flTime
  let rangeStartIndex = points.findIndex(
    point => point.flTime - firstPointTime >= rangeStartPosition
  )
  if (rangeStartIndex === -1) rangeStartIndex = 0

  const rangeStartPoint = points[rangeStartIndex]
  const rangeStartCoords = new LatLon(rangeStartPoint.latitude, rangeStartPoint.longitude)
  const rangeStartAltitude = rangeStartPoint.altitude
  let cumulativeDistance = 0

  return points.map((point, index) => {
    const elevation = Math.max(0, rangeStartAltitude - point.altitude)

    if (index > rangeStartIndex) {
      const currentCoords = new LatLon(point.latitude, point.longitude)

      if (straightLine) {
        cumulativeDistance = rangeStartCoords.distanceTo(currentCoords)
      } else {
        const prevPoint = points[index - 1]
        const prevCoords = new LatLon(prevPoint.latitude, prevPoint.longitude)
        cumulativeDistance += prevCoords.distanceTo(currentCoords)
      }
    }
    return { ...point, cumulativeDistance, elevation }
  })
}
