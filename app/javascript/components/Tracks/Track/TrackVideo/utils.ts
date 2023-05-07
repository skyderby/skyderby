import { PointRecord } from 'api/tracks/points'
import { VideoRecord } from 'api/tracks/video'
import getPointsAroundTime from './getPointsAroundTime'

const interpolateValue = (first: number, second: number, factor: number): number =>
  first + (second - first) * factor

const getInterpolatedPoint = (
  points: PointRecord[],
  flTime: number
): Partial<PointRecord> | null => {
  const [first, second] = getPointsAroundTime(points, flTime) ?? []

  if (!first || !second) return null

  const interpolationFactor = (flTime - first.flTime) / (second.flTime - first.flTime)

  return {
    altitude: interpolateValue(first.altitude, second.altitude, interpolationFactor),
    fullSpeed: interpolateValue(first.fullSpeed, second.fullSpeed, interpolationFactor),
    hSpeed: interpolateValue(first.hSpeed, second.hSpeed, interpolationFactor),
    vSpeed: interpolateValue(first.vSpeed, second.vSpeed, interpolationFactor),
    glideRatio: interpolateValue(first.glideRatio, second.glideRatio, interpolationFactor)
  }
}

export const getDataForTime = (
  points: PointRecord[],
  videoSettings: VideoRecord | undefined,
  time: number
): Partial<PointRecord> | null => {
  if (!videoSettings) return null

  const { trackOffset, videoOffset } = videoSettings
  const relativeTime = time - videoOffset

  if (relativeTime < 0) return null

  const trackTime = relativeTime + trackOffset

  return getInterpolatedPoint(points, trackTime)
}
