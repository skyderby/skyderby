import I18n from 'i18n'

export const horizontalSpeedSeries = (points, options) => ({
  name: I18n.t('charts.all_data.series.horiz_speed'),
  custom: { code: 'ground_speed' },
  type: 'spline',
  data: points.map(point => ({
    x: point.flTime - points[0].flTime,
    y: Math.round(point.hSpeed),
    custom: {
      altitude: Math.round(point.altitude),
      gpsTime: point.gpsTime,
      tooltipValue: `${Math.round(point.hSpeed)} ${I18n.t('units.kmh')}`
    }
  })),
  color: '#52A964',
  ...options
})

export const verticalSpeedSeries = (points, options) => ({
  name: I18n.t('charts.all_data.series.vert_speed'),
  custom: { code: 'vertical_speed' },
  type: 'spline',
  data: points.map(point => ({
    x: point.flTime - points[0].flTime,
    y: Math.round(point.vSpeed),
    custom: {
      altitude: Math.round(point.altitude),
      gpsTime: point.gpsTime,
      tooltipValue: `${Math.round(point.vSpeed)} ${I18n.t('units.kmh')}`
    }
  })),
  color: '#A7414E',
  ...options
})

export const fullSpeedSeries = (points, options) => ({
  name: I18n.t('charts.all_data.series.full_speed'),
  custom: { code: 'full_speed' },
  type: 'spline',
  data: points.map(point => ({
    x: point.flTime - points[0].flTime,
    y: Math.round(point.fullSpeed),
    custom: {
      altitude: Math.round(point.altitude),
      gpsTime: point.gpsTime,
      tooltipValue: `${Math.round(point.fullSpeed)} ${I18n.t('units.kmh')}`
    }
  })),
  color: '#D6A184',
  visible: false,
  ...options
})

export const zeroWindSpeedSeries = (points, options) => ({
  name: I18n.t('charts.spd.series.wind_effect'),
  custom: { code: 'speed_wind_effect' },
  data: points.map(point => {
    const windEffect = point.hSpeed - point.zerowindHSpeed
    const effectSign = windEffect > 0 ? '+' : ''

    return {
      x: point.flTime - points[0].flTime,
      low: Math.round(point.hSpeed),
      high: Math.round(point.zerowindHSpeed),
      custom: {
        altitude: Math.round(point.altitude),
        gpsTime: point.gpsTime,
        tooltipValue: `${effectSign}${Math.round(windEffect)} ${I18n.t('units.kmh')}`
      }
    }
  }),
  type: 'arearange',
  color: 'rgba(178, 201, 171, 0.5)',
  lineWidth: 1,
  dashStyle: 'ShortDash',
  ...options
})
