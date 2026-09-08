import {
  haversineDistance,
  altitudeCrossing,
  valueAtCrossing,
  timeAtIndex,
  timeOf
} from './pointHelpers'

export const buildProcessedPoints = (points, { startTime, timeOffset = 0 }) => {
  let distance = 0

  return points.map((point, index) => {
    if (index > 0) distance += haversineDistance(points[index - 1], point)
    const gpsTime = timeOf(point) + timeOffset

    return {
      playerTime: (gpsTime - startTime) / 1000,
      altitude: point.altitude,
      distance,
      latitude: point.latitude,
      longitude: point.longitude,
      hSpeed: point.hSpeed,
      vSpeed: point.vSpeed,
      fullSpeed: point.fullSpeed,
      glideRatio: point.glideRatio,
      gpsTime: new Date(gpsTime),
      srcGpsTime: point.gpsTime
    }
  })
}

export const windowEntryValue = (points, altitude, key) =>
  valueAtCrossing(points, altitudeCrossing(points, altitude), key) ??
  points[0]?.[key] ??
  0

export const windowEntryTime = (points, altitude) => {
  const crossing = altitudeCrossing(points, altitude)
  return crossing ? timeAtIndex(points, crossing.index, crossing.fraction) : null
}

export const alignCompareTrack = ({
  points,
  comparePoints,
  chartPoints,
  processedPoints,
  windowFrom,
  windowStartTime,
  windowEndTime,
  bufferSeconds = 3
}) => {
  if (!comparePoints?.length) return null

  const primaryEntry = windowEntryTime(points, windowFrom)
  const compareEntry = windowEntryTime(comparePoints, windowFrom)
  if (primaryEntry == null || compareEntry == null) return null

  const timeOffset = primaryEntry - compareEntry
  const start = windowStartTime - timeOffset - bufferSeconds * 1000
  const end = windowEndTime - timeOffset + bufferSeconds * 1000

  const compareChartPoints = comparePoints.filter(point => {
    const time = timeOf(point)
    return time >= start && time <= end
  })
  if (compareChartPoints.length === 0) return null

  const primaryEntryX =
    windowEntryValue(chartPoints, windowFrom, 'flTime') - chartPoints[0].flTime
  const compareEntryX =
    windowEntryValue(compareChartPoints, windowFrom, 'flTime') -
    compareChartPoints[0].flTime

  const compareProcessedPoints = buildProcessedPoints(comparePoints, {
    startTime: timeOf(chartPoints[0]),
    timeOffset
  })
  const distanceOffset =
    windowEntryValue(processedPoints, windowFrom, 'distance') -
    windowEntryValue(compareProcessedPoints, windowFrom, 'distance')
  compareProcessedPoints.forEach(point => {
    point.distance += distanceOffset
  })

  return {
    timeOffset,
    chartTimeOffset: primaryEntryX - compareEntryX,
    compareChartPoints,
    compareProcessedPoints
  }
}
