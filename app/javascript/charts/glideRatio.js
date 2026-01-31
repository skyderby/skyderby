import I18n from 'i18n'
import { restoreSeriesVisibility, saveSeriesVisibility, tooltipFormatter } from './utils'

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
  name: 'Glide Ratio Wind Effect',
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
  color: 'rgba(63, 136, 167, 0.3)',
  lineWidth: 1,
  dashStyle: 'ShortDash',
  ...options
})

export const compareGlideRatioSeries = (
  points,
  primaryPoints,
  timeOffset,
  name,
  options
) => ({
  name: name || 'Comparison',
  custom: { code: 'gr_compare' },
  type: 'spline',
  color: '#9e9e9e',
  dashStyle: 'ShortDash',
  data: points.map(point => {
    const relativeTime = point.flTime - points[0].flTime
    const adjustedTime = relativeTime + timeOffset
    return {
      x: adjustedTime,
      y: clampGlideValue(point.glideRatio),
      custom: {
        tooltipValue: Math.round(point.glideRatio * 100) / 100,
        altitude: Math.round(point.altitude),
        gpsTime: point.gpsTime
      }
    }
  }),
  ...options
})

export const initGlideChart = (
  container,
  points,
  {
    plotLines = [],
    plotBands = [],
    windCancellation = false,
    showTitle = true,
    showLegend = true,
    comparePoints = null,
    compareTimeOffset = 0,
    compareTrackName = null
  } = {}
) => {
  const chartName = 'GlideChart'

  const series = [
    glideRatioSeries(points),
    windCancellation && zeroWindGlideRatioSeries(points),
    comparePoints &&
      comparePoints.length > 0 &&
      compareGlideRatioSeries(comparePoints, points, compareTimeOffset, compareTrackName)
  ].filter(Boolean)

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
          text: I18n.t('charts.gr.title'),
          style: { color: 'var(--gray-80)', fontSize: '16px' }
        }
      : undefined,
    legend: { enabled: showLegend },
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
    tooltip: {
      crosshairs: true,
      shared: true,
      valueDecimals: 2,
      useHTML: true,
      formatter: tooltipFormatter
    },
    xAxis: {
      plotLines,
      plotBands
    },
    yAxis: {
      min: 0,
      max: 7.5,
      startOnTick: false,
      endOnTick: false,
      minPadding: 0.2,
      maxPadding: 0.2,
      tickInterval: 1,
      title: {
        text: null
      },
      labels: {
        x: 20,
        y: -2,
        formatter: function () {
          return this.isLast ? '≥ 7' : this.value
        }
      }
    },
    credits: { enabled: false },
    series
  }

  return Highcharts.chart(container, chartOptions)
}
