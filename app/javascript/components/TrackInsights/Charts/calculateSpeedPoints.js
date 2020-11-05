import { METRIC, IMPERIAL } from 'redux/userPreferences'
import { msToKmh, msToMph } from 'utils/unitsConversion'

const convertValue = (value, unitSystem) => {
  if (unitSystem === METRIC) return msToKmh(value)
  if (unitSystem === IMPERIAL) return msToMph(value)

  return value
}

const convertUnits = (point, unitSystem) => ({
  ...point,
  hSpeed: convertValue(point.hSpeed, unitSystem),
  vSpeed: convertValue(point.vSpeed, unitSystem)
})

const calculateVerticalSpeedPoints = points =>
  points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: Math.round(el.vSpeed),
    altitude: Math.round(el.altitude)
  }))

const calculateHorizontalSpeedPoints = points =>
  points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: Math.round(el.hSpeed),
    altitude: Math.round(el.altitude)
  }))

const calculateFullSpeedPoints = points =>
  points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: Math.round(Math.sqrt(el.hSpeed ** 2 + el.vSpeed ** 2)),
    altitude: Math.round(el.altitude)
  }))

const calculateZeroWindSpeedPoints = (zeroWindPoints, points) =>
  zeroWindPoints.map((point, idx) => ({
    x: Math.round((point.flTime - zeroWindPoints[0].flTime) * 10) / 10,
    low: Math.round(point.hSpeed),
    high: Math.round(points[idx].hSpeed),
    altitude: Math.round(point.altitude)
  }))

export const calculateSpeedPoints = (points, zeroWindPoints, unitSystem) => {
  const convertedPoints = points.map(point => convertUnits(point, unitSystem))
  const convertedZeroWindPoints = zeroWindPoints.map(point =>
    convertUnits(point, unitSystem)
  )

  return {
    verticalSpeed: calculateVerticalSpeedPoints(convertedPoints),
    horizontalSpeed: calculateHorizontalSpeedPoints(convertedPoints),
    fullSpeed: calculateFullSpeedPoints(convertedPoints),
    zeroWindSpeed: calculateZeroWindSpeedPoints(convertedZeroWindPoints, convertedPoints)
  }
}
