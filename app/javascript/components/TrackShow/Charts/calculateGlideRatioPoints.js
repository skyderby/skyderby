const clampValue = val => Math.round(Math.min(Math.max(val, 0), 7) * 100) / 100

const calculateGlideRatio = points =>
  points.map(el => ({
    x: Math.round((el.flTime - points[0].flTime) * 10) / 10,
    y: clampValue(el.glideRatio, 0),
    trueValue: Math.round(el.glideRatio * 100) / 100,
    altitude: Math.round(el.altitude)
  }))

const calculateZeroWindGlideRatio = (points, zeroWindPoints) =>
  zeroWindPoints.map((el, idx, arr) => ({
    x: Math.round((el.flTime - arr[0].flTime) * 10) / 10,
    low: clampValue(el.glideRatio),
    high: clampValue(points[idx].glideRatio),
    trueValue: Math.round(el.glideRatio * 100) / 100
  }))

export const calculateGlideRatioPoints = (points, zeroWindPoints) => {
  return {
    glideRatio: calculateGlideRatio(points),
    zeroWindGlideRatio: calculateZeroWindGlideRatio(points, zeroWindPoints)
  }
}
