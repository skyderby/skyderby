import { PointOptionsObject } from 'highcharts'
import { PointRecord } from 'api/hooks/tracks/points'

const clampValue = (val: number): number =>
  Math.round(Math.min(Math.max(val, 0), 7) * 100) / 100

const calculateGlideRatio = (points: PointRecord[]): PointOptionsObject[] =>
  points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: clampValue(el.glideRatio),
    custom: {
      trueValue: Math.round(el.glideRatio * 100) / 100,
      altitude: Math.round(el.altitude)
    }
  }))

const calculateZeroWindGlideRatio = (
  points: PointRecord[],
  zeroWindPoints: PointRecord[]
): PointOptionsObject[] =>
  zeroWindPoints.map((el, idx, arr) => ({
    x: Math.round((el.flTime - arr[0].flTime) * 10) / 10,
    low: clampValue(el.glideRatio),
    high: clampValue(points[idx].glideRatio),
    custom: {
      trueValue: Math.round(el.glideRatio * 100) / 100
    }
  }))

interface GlideRatioPoints {
  glideRatio: PointOptionsObject[]
  zeroWindGlideRatio: PointOptionsObject[]
}

export const calculateGlideRatioPoints = (
  points: PointRecord[],
  zeroWindPoints: PointRecord[]
): GlideRatioPoints => {
  return {
    glideRatio: calculateGlideRatio(points),
    zeroWindGlideRatio: calculateZeroWindGlideRatio(points, zeroWindPoints)
  }
}
