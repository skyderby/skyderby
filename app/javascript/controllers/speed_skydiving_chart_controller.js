import { Controller } from '@hotwired/stimulus'
import { differenceInMilliseconds } from 'date-fns'
import I18n from 'i18n'
import {
  saveSeriesVisibility,
  restoreSeriesVisibility,
  glideRatioSeries,
  zeroWindGlideRatioSeries,
  horizontalSpeedSeries,
  verticalSpeedSeries,
  fullSpeedSeries,
  zeroWindSpeedSeries,
  altitudeSeries,
  tooltipFormatter,
  findPositionForAltitude
} from 'charts'

const breakoffAltitude = 1707 // 5600 ft
const windowHeight = 2256 // 7400 ft
const validationWindowHeight = 1000
const chartName = 'SpeedSkydivingCombinedChart'

const accuracySeries = (points, windowEndAltitude) => {
  const validationWindowStart = windowEndAltitude + validationWindowHeight

  return {
    name: 'Speed Accuracy',
    type: 'column',
    yAxis: 2,
    zones: [{ value: 0, color: '#ccc' }, { value: 3, color: '#ccc' }, { color: 'red' }],
    data: points
      .filter(
        point =>
          point.altitude <= validationWindowStart && point.altitude >= windowEndAltitude
      )
      .map(point => ({
        x: point.flTime - points[0].flTime,
        y: (Math.sqrt(2) * point.verticalAccuracy) / 3,
        custom: {
          tooltipValue:
            Math.round(((Math.sqrt(2) * point.verticalAccuracy) / 3) * 10) / 10,
          altitude: Math.round(point.altitude),
          gpsTime: point.gpsTime
        }
      }))
  }
}

export default class SpeedSkydivingChart extends Controller {
  connect() {
    this.trackId = this.element.getAttribute('data-track-id')
    this.result = Number(this.element.getAttribute('data-result'))
    this.exitAltitude = Number(this.element.getAttribute('data-exit-altitude'))
    this.windowStartTime = new Date(this.element.getAttribute('data-window-start'))
    this.windowEndTime = new Date(this.element.getAttribute('data-window-end'))

    this.fetchPoints(this.trackId).then(this.initChart.bind(this))
  }

  fetchPoints(trackId) {
    return fetch(`/tracks/${trackId}/points?original_frequency=true`, {
      headers: { Accept: 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        data.points.forEach(point => {
          point.gpsTime = new Date(point.gpsTime)
          point.hSpeed = point.hSpeed * 3.6
          point.vSpeed = point.vSpeed * 3.6
          point.fullSpeed = point.fullSpeed * 3.6
          if (point.zerowindHSpeed) point.zerowindHSpeed = point.zerowindHSpeed * 3.6
        })

        return data
      })
  }

  initChart({ points, windCancellation }) {
    const windowEndAltitude = Math.max(this.exitAltitude - windowHeight, breakoffAltitude)

    const plotLineValue = findPositionForAltitude(points, windowEndAltitude)

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
        plotLines: [
          {
            value: plotLineValue,
            width: 1,
            color: 'red',
            label: {
              text: `End of window - ${windowEndAltitude.toFixed()} ${I18n.t('units.m')}`,
              style: { color: 'red' },
              y: 100
            }
          }
        ],
        plotBands: [
          {
            color: 'rgba(0, 150, 0, 0.25)',
            zIndex: 8,
            label: {
              text: `Best speed: ${this.result.toFixed(2)} ${I18n.t('units.kmh')}`,
              rotation: 90,
              textAlign: 'left',
              y: 100
            },
            from:
              differenceInMilliseconds(this.windowStartTime, points[0].gpsTime) / 1000,
            to: differenceInMilliseconds(this.windowEndTime, points[0].gpsTime) / 1000
          }
        ]
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
          max: 50,
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
        accuracySeries(points, windowEndAltitude)
      ].filter(Boolean)
    }

    this.element.chart = Highcharts.chart(this.element, chartOptions)
  }
}
