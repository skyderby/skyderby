import I18n from 'i18n'

export const altitudeSeries = (points, options) => ({
  name: I18n.t('charts.all_data.series.height'),
  custom: {
    code: 'height'
  },
  type: 'area',
  data: points.map(point => ({
    x: point.flTime - points[0].flTime,
    y: Math.round(point.altitude),
    custom: {
      tooltipValue: Math.round(point.altitude),
      altitude: Math.round(point.altitude),
      gpsTime: point.gpsTime
    }
  })),
  yAxis: 0,
  color: '#7cb5ec',
  ...options
})
