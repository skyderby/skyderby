function interpolatedPoint(first, second, time) {
  const interpolationFactor =
    (time - first.playerTime) / (second.playerTime - first.playerTime)

  const interpolatedAttrs = [
    'altitude',
    'chartDistance',
    'distance',
    'speed',
    'vSpeed',
    'time'
  ].reduce((acc, key) => {
    acc[key] = interpolate(first, second, key, interpolationFactor)

    if (key === 'time') {
      acc[key] = Math.round(acc[key] * 10) / 10
    } else if (['distance', 'speed', 'vSpeed'].includes(key)) {
      acc[key] = Math.round(acc[key])
    }

    return acc
  }, {})

  return {
    ...first,
    ...interpolatedAttrs
  }
}

function interpolate(first, second, attribute, factor) {
  return first[attribute] + (second[attribute] - first[attribute]) * factor
}

export default function getPathsUntilTime(points, time) {
  const seekTime = time - 5
  const pointsBeforeTime = points.filter(el => el.playerTime <= seekTime)
  const nextPoint = points[pointsBeforeTime.length]

  if (nextPoint) {
    pointsBeforeTime.push(
      interpolatedPoint(
        pointsBeforeTime[pointsBeforeTime.length - 1],
        nextPoint,
        seekTime
      )
    )
  }

  return pointsBeforeTime
}
