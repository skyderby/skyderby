const clampGlideValue = val => Math.round(Math.min(Math.max(val, 0), 7) * 100) / 100

export const glideRatioSeries = (points, options) => ({
  name: 'Glide Ratio',
  custom: { code: 'gr' },
  type: 'spline',
  zones: [
    { value: 0.1, color: '#e3353f' },
    { value: 6.8, color: '#37889B' },
    { color: '#e3353f' }
  ],
  color: '#37889B',
  data: points.map(point => ({
    x: point.flTime - points[0].flTime,
    y: clampGlideValue(point.glideRatio),
    custom: {
      tooltipValue: Math.round(point.glideRatio * 100) / 100,
      altitude: Math.round(point.altitude),
      gpsTime: point.gpsTime
    }
  })),
  ...options
})

export const zeroWindGlideRatioSeries = (points, options) => ({
  custom: { code: 'gr_wind_effect' },
  type: 'arearange',
  data: points.map(point => {
    const windEffect = point.zerowindGlideRatio - point.glideRatio
    const effectSign = windEffect > 0 ? '+' : ''

    return {
      x: point.flTime - points[0].flTime,
      low: clampGlideValue(point.glideRatio),
      high: clampGlideValue(point.zerowindGlideRatio),
      custom: {
        tooltipValue: `${effectSign}${windEffect.toFixed(2)}`
      }
    }
  }),
  yAxis: 2,
  color: 'rgba(63, 136, 167, 0.3)',
  lineWidth: 1,
  dashStyle: 'ShortDash',
  options
})
