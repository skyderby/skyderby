const getPointsAroundTime = (points, flTime) => {
  for (let idx = 0; idx < points.length; idx++) {
    if (idx === 0) continue

    const first = points[idx - 1]
    const second = points[idx]

    if (first.flTime <= flTime && flTime <= second.flTime) {
      return [first, second]
    }
  }

  return []
}

const interpolateValue = (first, second, factor) => first + (second - first) * factor

const getInterpolatedPoint = (points, flTime) => {
  const [first, second] = getPointsAroundTime(points, flTime)

  if (!first || !second) return null

  const interpolationFactor = (flTime - first.flTime) / (second.flTime - first.flTime)

  return {
    altitude: interpolateValue(first.altitude, second.altitude, interpolationFactor),
    hSpeed: interpolateValue(first.hSpeed, second.hSpeed, interpolationFactor),
    vSpeed: interpolateValue(first.vSpeed, second.vSpeed, interpolationFactor),
    glideRatio: interpolateValue(first.glideRatio, second.glideRatio, interpolationFactor)
  }
}

export const getDataForTime = (points, videoSettings, time) => {
  const { trackOffset, videoOffset } = videoSettings
  const relativeTime = time - videoOffset

  if (relativeTime < 0) return null

  const trackTime = relativeTime + trackOffset

  return getInterpolatedPoint(points, trackTime)
}
