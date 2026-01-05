import I18n from 'i18n'
import {
  altitudeSeries,
  elevationSeries,
  distanceSeries,
  calculateCumulativeDistance
} from './altitudeDistance'
import { glideRatioSeries, zeroWindGlideRatioSeries } from './glideRatio'
import {
  horizontalSpeedSeries,
  verticalSpeedSeries,
  fullSpeedSeries,
  zeroWindSpeedSeries
} from './speed'
import { sep50Series } from './sepChart'
import { restoreSeriesVisibility, saveSeriesVisibility, tooltipFormatter } from './utils'

export const initCombinedChart = (
  container,
  points,
  {
    plotLines = [],
    plotBands = [],
    windCancellation = false,
    straightLine = false,
    rangeStartPosition = 0,
    chartName = 'CombinedChart'
  } = {}
) => {
  const pointsWithDistance = calculateCumulativeDistance(points, {
    straightLine,
    rangeStartPosition
  })
  const chartOptions = {
    chart: {
      height: 600,
      events: {
        load: function () {
          restoreSeriesVisibility(chartName, this.series)
        }
      }
    },
    title: undefined,
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
        },
        states: {
          inactive: {
            enabled: false
          }
        }
      }
    },
    xAxis: {
      crosshair: true,
      plotLines,
      plotBands
    },
    yAxis: [
      {
        title: {
          text: I18n.t('charts.all_data.series.height')
        },
        tickInterval: 200
      },
      {
        title: {
          text: I18n.t('charts.all_data.axis.speed')
        },
        min: 0,
        gridLineWidth: 0,
        opposite: true
      },
      {
        min: 0,
        max: 7,
        startOnTick: false,
        endOnTick: false,
        minPadding: 0.2,
        maxPadding: 0.2,
        gridLineWidth: 0,
        title: {
          text: I18n.t('charts.all_data.axis.gr')
        },
        labels: {
          formatter: function () {
            return this.isLast ? '≥ 7' : String(this.value)
          }
        },
        opposite: true
      },
      {
        min: 0,
        max: 75,
        visible: false
      }
    ],
    tooltip: {
      shared: true,
      useHTML: true,
      formatter: tooltipFormatter
    },
    credits: {
      enabled: false
    },
    series: [
      altitudeSeries(pointsWithDistance, { yAxis: 0, color: '#aaa', type: 'spline' }),
      elevationSeries(pointsWithDistance, { yAxis: 0, visible: false }),
      distanceSeries(pointsWithDistance, { yAxis: 0, visible: false }),
      horizontalSpeedSeries(pointsWithDistance, { yAxis: 1 }),
      verticalSpeedSeries(pointsWithDistance, { yAxis: 1 }),
      fullSpeedSeries(pointsWithDistance, { yAxis: 1 }),
      windCancellation && zeroWindSpeedSeries(pointsWithDistance, { yAxis: 1 }),
      glideRatioSeries(pointsWithDistance, { yAxis: 2 }),
      windCancellation && zeroWindGlideRatioSeries(pointsWithDistance, { yAxis: 2 }),
      sep50Series(pointsWithDistance, { yAxis: 3 })
    ].filter(Boolean)
  }

  return Highcharts.chart(container, chartOptions)
}
