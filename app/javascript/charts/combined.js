import I18n from 'i18n'
import { altitudeSeries } from './altitudeDistance'
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
    chartName = 'CombinedChart'
  } = {}
) => {
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
      altitudeSeries(points, { yAxis: 0, color: '#aaa', type: 'spline' }),
      horizontalSpeedSeries(points, { yAxis: 1 }),
      verticalSpeedSeries(points, { yAxis: 1 }),
      fullSpeedSeries(points, { yAxis: 1 }),
      windCancellation && zeroWindSpeedSeries(points, { yAxis: 1 }),
      glideRatioSeries(points, { yAxis: 2 }),
      windCancellation && zeroWindGlideRatioSeries(points, { yAxis: 2 }),
      sep50Series(points, { yAxis: 3 })
    ].filter(Boolean)
  }

  return Highcharts.chart(container, chartOptions)
}
