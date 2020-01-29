const findStartIndex = (points, fromAltitude) => {
  if (fromAltitude === undefined) return 0

  return Math.max(points.findIndex(el => el.altitude <= fromAltitude), 0)
}

const findEndIndex = (points, startPoint, toAltitude) => {
  const lastIdx = points.length - 1

  if (toAltitude === undefined) return lastIdx

  const idx = points.findIndex(
      el => el.altitude <= toAltitude && el.gpsTime > startPoint.gpsTime
    )

  return idx > -1 ? idx : lastIdx
}

const interpolateByAltitude = (first, second, altitude) => {
  const coeff = (first.altitude - altitude) / (first.altitude - second.altitude)

  const newPoint = { ...first, altitude }

  const filedsToInterpolate = [
    'gpsTime',
    'flTime',
    'latitude',
    'longitude',
    'hSpeed',
    'vSpeed',
    'glideRatio'
  ]

  filedsToInterpolate.forEach(key => {
    newPoint[key] = interpolateField(first, second, key, coeff)
  })

  return newPoint
}

const interpolateField = (first, second, key, coeff) => {
  return first[key] + (second[key] - first[key]) * coeff
}

export const cropPoints = (points = [], fromAltitude, toAltitude) => {
  if (points.length <= 1) return points

  const startIndex = findStartIndex(points, fromAltitude)
  const startPoint = points[startIndex]

  const endIndex = findEndIndex(points, startPoint, toAltitude)
  const endPoint = points[endIndex]

  const prepend =
    startIndex === 0 || startPoint.altitude === fromAltitude
      ? []
      : [interpolateByAltitude(points[startIndex - 1], startPoint, fromAltitude)]

  const append =
    endIndex === points.length - 1 || endPoint.altitude === toAltitude
      ? [points[endIndex]]
      : [interpolateByAltitude(points[endIndex - 1], endPoint, toAltitude)]

  return [...prepend, ...points.slice(startIndex, endIndex), ...append]
}
