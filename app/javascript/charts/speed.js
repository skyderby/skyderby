import I18n from 'i18n'
import { restoreSeriesVisibility, saveSeriesVisibility, tooltipFormatter } from './utils'

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

export const compareHorizontalSpeedSeries = (
  points,
  primaryPoints,
  timeOffset,
  name,
  options
) => ({
  name: name ? `${name} H` : 'Comparison H',
  custom: { code: 'compare_ground_speed' },
  type: 'spline',
  color: '#9e9e9e',
  dashStyle: 'ShortDash',
  data: points.map(point => {
    const relativeTime = point.flTime - points[0].flTime
    const adjustedTime = relativeTime + timeOffset
    return {
      x: adjustedTime,
      y: Math.round(point.hSpeed),
      custom: {
        altitude: Math.round(point.altitude),
        gpsTime: point.gpsTime,
        tooltipValue: `${Math.round(point.hSpeed)} ${I18n.t('units.kmh')}`
      }
    }
  }),
  ...options
})

export const compareVerticalSpeedSeries = (
  points,
  primaryPoints,
  timeOffset,
  name,
  options
) => ({
  name: name ? `${name} V` : 'Comparison V',
  custom: { code: 'compare_vertical_speed' },
  type: 'spline',
  color: '#bdbdbd',
  dashStyle: 'ShortDash',
  data: points.map(point => {
    const relativeTime = point.flTime - points[0].flTime
    const adjustedTime = relativeTime + timeOffset
    return {
      x: adjustedTime,
      y: Math.round(point.vSpeed),
      custom: {
        altitude: Math.round(point.altitude),
        gpsTime: point.gpsTime,
        tooltipValue: `${Math.round(point.vSpeed)} ${I18n.t('units.kmh')}`
      }
    }
  }),
  ...options
})

export const initSpeedsChart = (
  container,
  points,
  {
    plotLines = [],
    plotBands = [],
    windCancellation = false,
    showTitle = true,
    comparePoints = null,
    compareTimeOffset = 0,
    compareTrackName = null
  } = {}
) => {
  const chartName = 'SpeedsChart'

  const chartOptions = {
    chart: {
      type: 'spline',
      styledMode: true,
      events: {
        load: function () {
          restoreSeriesVisibility(chartName, this.series)
        }
      }
    },
    title: showTitle
      ? {
          text: I18n.t('charts.spd.title'),
          style: { color: 'var(--gray-80)', fontSize: '16px' }
        }
      : undefined,
    plotOptions: {
      spline: {
        marker: {
          enabled: false
        }
      },
      series: {
        marker: {
          radius: 1
        },
        events: {
          legendItemClick: function () {
            saveSeriesVisibility(chartName, this.options.custom?.code, !this.visible)
          }
        }
      }
    },
    xAxis: {
      plotLines,
      plotBands
    },
    yAxis: [
      {
        min: 0,
        labels: {
          x: 20,
          y: -2,
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        title: {
          text: null,
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        }
      }
    ],
    tooltip: {
      shared: true,
      crosshairs: true,
      useHTML: true,
      valueDecimals: 0,
      formatter: tooltipFormatter
    },
    credits: { enabled: false },
    series: [
      horizontalSpeedSeries(points),
      verticalSpeedSeries(points),
      fullSpeedSeries(points),
      windCancellation && zeroWindSpeedSeries(points),
      comparePoints &&
        comparePoints.length > 0 &&
        compareHorizontalSpeedSeries(
          comparePoints,
          points,
          compareTimeOffset,
          compareTrackName
        ),
      comparePoints &&
        comparePoints.length > 0 &&
        compareVerticalSpeedSeries(
          comparePoints,
          points,
          compareTimeOffset,
          compareTrackName
        )
    ].filter(Boolean)
  }

  return Highcharts.chart(container, chartOptions)
}
