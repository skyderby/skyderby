import { METRIC, IMPERIAL, UnitSystem } from 'components/TrackViewPreferences'
import { msToKmh, msToMph } from 'utils/unitsConversion'
import { PointRecord } from 'api/tracks/points'
import type { PointOptionsObject } from 'highcharts'

const convertValue = (value: number, unitSystem: UnitSystem) => {
  if (unitSystem === METRIC) return msToKmh(value)
  if (unitSystem === IMPERIAL) return msToMph(value)

  return value
}

const convertUnits = (point: PointRecord, unitSystem: UnitSystem) => ({
  ...point,
  fullSpeed: convertValue(point.fullSpeed, unitSystem),
  hSpeed: convertValue(point.hSpeed, unitSystem),
  vSpeed: convertValue(point.vSpeed, unitSystem)
})

const calculateVerticalSpeedPoints = (points: PointRecord[]): PointOptionsObject[] =>
  points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: Math.round(el.vSpeed),
    custom: {
      altitude: Math.round(el.altitude)
    }
  }))

const calculateHorizontalSpeedPoints = (points: PointRecord[]): PointOptionsObject[] =>
  points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: Math.round(el.hSpeed),
    custom: {
      altitude: Math.round(el.altitude)
    }
  }))

const calculateFullSpeedPoints = (points: PointRecord[]): PointOptionsObject[] =>
  points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: Math.round(el.fullSpeed),
    custom: {
      altitude: Math.round(el.altitude)
    }
  }))

const calculateZeroWindSpeedPoints = (
  zeroWindPoints: PointRecord[],
  points: PointRecord[]
): PointOptionsObject[] =>
  zeroWindPoints.map((point, idx) => ({
    x: Math.round((point.flTime - zeroWindPoints[0].flTime) * 10) / 10,
    low: Math.round(point.hSpeed),
    high: Math.round(points[idx].hSpeed),
    custom: {
      altitude: Math.round(point.altitude)
    }
  }))

type SpeedChartPoints = {
  verticalSpeed: PointOptionsObject[]
  horizontalSpeed: PointOptionsObject[]
  fullSpeed: PointOptionsObject[]
  zeroWindSpeed: PointOptionsObject[]
}

export const calculateSpeedPoints = (
  points: PointRecord[],
  zeroWindPoints: PointRecord[],
  unitSystem: UnitSystem
): SpeedChartPoints => {
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
