import { vincentyDistance } from '../utils/geo'

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
  const rangeStartAltitude = rangeStartPoint.altitude
  let cumulativeDistance = 0

  return points.map((point, index) => {
    const elevation = Math.max(0, rangeStartAltitude - point.altitude)

    if (index > rangeStartIndex) {
      if (straightLine) {
        cumulativeDistance = vincentyDistance(rangeStartPoint, point)
      } else {
        cumulativeDistance += vincentyDistance(points[index - 1], point)
      }
    }
    return { ...point, cumulativeDistance, elevation }
  })
}
