const interpolateField = (first, second, coeff) => first + (second - first) * coeff

const interpolateByAltitude = (first, second, altitude) => {
  const coeff = (first.altitude - altitude) / (first.altitude - second.altitude)

  const newPoint = { ...first, altitude }

  const numericFields = [
    'absAltitude',
    'flTime',
    'latitude',
    'longitude',
    'hSpeed',
    'vSpeed',
    'glideRatio',
    'speedAccuracy',
    'verticalAccuracy',
    'zerowindLatitude',
    'zerowindLongitude'
  ]

  numericFields.forEach(key => {
    if (first[key] != null && second[key] != null) {
      newPoint[key] = interpolateField(first[key], second[key], coeff)
    }
  })

  const startTime = first.gpsTime.getTime()
  const endTime = second.gpsTime.getTime()
  newPoint.gpsTime = new Date(startTime + (endTime - startTime) * coeff)

  return newPoint
}

const findStartIndex = (points, fromAltitude) => {
  if (fromAltitude === undefined) return 0

  return Math.max(
    points.findIndex(el => el.altitude <= fromAltitude),
    0
  )
}

const findEndIndex = (points, startPoint, toAltitude) => {
  const lastIdx = points.length - 1

  if (toAltitude === undefined) return lastIdx

  const idx = points.findIndex(
    el => el.altitude <= toAltitude && el.gpsTime > startPoint.gpsTime
  )

  return idx > -1 ? idx : lastIdx
}

const cropPoints = (points, fromAltitude, toAltitude) => {
  if (points.length <= 1) return points

  const startIndex = findStartIndex(points, fromAltitude)
  const startPoint = points[startIndex]

  const endIndex = findEndIndex(points, startPoint, toAltitude)
  const endPoint = points[endIndex]

  const pointsToPrepend =
    startIndex === 0 || startPoint.altitude === fromAltitude
      ? []
      : [interpolateByAltitude(points[startIndex - 1], startPoint, fromAltitude)]

  const pointsToAppend =
    !toAltitude || endPoint.altitude === toAltitude
      ? [points[endIndex]]
      : [interpolateByAltitude(points[endIndex - 1], endPoint, toAltitude)]

  return [...pointsToPrepend, ...points.slice(startIndex, endIndex), ...pointsToAppend]
}

export default cropPoints
