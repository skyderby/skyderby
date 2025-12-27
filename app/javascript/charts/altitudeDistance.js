import I18n from 'i18n'
import { restoreSeriesVisibility, saveSeriesVisibility, tooltipFormatter } from './utils'

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

export const initAltitudeDistanceChart = (
  container,
  points,
  { plotLines = [], plotBands = [] } = {}
) => {
  const chartName = 'AltitudeDistance'

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
    title: {
      text: I18n.t('charts.elev.title'),
      style: { color: '#777', fontSize: '16px' }
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: false
        }
      },
      area: {
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
      labels: {
        enabled: false
      },
      tickWidth: 0,
      plotLines,
      plotBands
    },
    yAxis: {
      min: 0,
      title: {
        text: ''
      },
      labels: {
        x: 20,
        y: -2
      }
    },
    tooltip: {
      shared: true,
      crosshairs: true,
      useHTML: true,
      formatter: tooltipFormatter
    },
    credits: { enabled: false },
    series: [altitudeSeries(points)]
  }

  return Highcharts.chart(container, chartOptions)
}
