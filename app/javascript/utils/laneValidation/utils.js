export {
  interpolatePointByAltitude,
  interpolatePointByTime
} from '../tracks/pointHelpers'

export function findDeployPoint(points, deployFlTime) {
  if (!deployFlTime || !points || points.length === 0) return null

  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].flTime <= deployFlTime) {
      return points[i]
    }
  }

  return null
}
