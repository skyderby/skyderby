import { Controller } from '@hotwired/stimulus'
import { differenceInMilliseconds } from 'utils/date'
import I18n from 'i18n'
import { fetchTrackPoints, fetchHeadPositions } from 'utils/tracks/trackData'
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
const positionsStorageKey = `${chartName}/head_position_panel`

const readPositionsPreference = () => {
  try {
    return localStorage.getItem(positionsStorageKey) === 'true'
  } catch {
    return false
  }
}

const savePositionsPreference = visible => {
  try {
    localStorage.setItem(positionsStorageKey, String(visible))
    return true
  } catch {
    return false
  }
}

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

const positionSeries = (points, positions) => {
  const startTime = points[0].gpsTime.getTime()
  const data = []
  let pointIndex = 0
  let previousX = null

  positions.forEach(position => {
    const x = (new Date(position.gpsTime).getTime() - startTime) / 1000
    while (
      pointIndex < points.length - 1 &&
      points[pointIndex + 1].flTime - points[0].flTime <= x
    )
      pointIndex++

    if (previousX !== null && x - previousX > 1) data.push({ x, y: null })
    data.push({
      x,
      y: position.pitch,
      custom: {
        altitude: Math.round(points[pointIndex].altitude),
        tooltipValue: `${position.pitch > 0 ? '+' : ''}${Math.round(position.pitch)}°`
      }
    })
    previousX = x
  })

  return {
    name: I18n.t('tracks.speed_pro.metrics.position'),
    custom: { code: 'head_position' },
    type: 'line',
    yAxis: 4,
    color: '#7b4fb0',
    lineWidth: 1.5,
    data
  }
}

export default class SpeedSkydivingChart extends Controller {
  static targets = ['chart', 'positionsSwitch']

  connect() {
    this.trackId = this.element.getAttribute('data-track-id')
    this.result = Number(this.element.getAttribute('data-result'))
    this.exitAltitude = Number(this.element.getAttribute('data-exit-altitude'))
    this.windowStartTime = new Date(this.element.getAttribute('data-window-start'))
    this.windowEndTime = new Date(this.element.getAttribute('data-window-end'))
    this.positionsUrl = this.element.getAttribute('data-positions-url')
    this.showPositions = Boolean(this.positionsUrl) && readPositionsPreference()
    if (this.hasPositionsSwitchTarget)
      this.positionsSwitchTarget.checked = this.showPositions

    Promise.all([this.fetchPoints(this.trackId), this.loadPositions()])
      .then(([data]) => {
        this.trackData = data
        this.render()
      })
      .catch(error => console.error('Failed to load speed skydiving chart', error))
  }

  get chartElement() {
    return this.hasChartTarget ? this.chartTarget : this.element
  }

  async loadPositions() {
    if (!this.showPositions || this.positions) return
    this.positions = await fetchHeadPositions(this.positionsUrl)
  }

  async togglePositions(event) {
    this.showPositions = event.currentTarget.checked
    savePositionsPreference(this.showPositions)
    await this.loadPositions()
    this.render()
  }

  render() {
    if (!this.trackData) return
    this.chartElement.chart?.destroy()
    this.initChart(this.trackData, this.showPositions ? this.positions || [] : [])
  }

  fetchPoints(trackId) {
    return fetchTrackPoints(`/tracks/${trackId}/points`, {
      params: { original_frequency: true },
      convertSpeeds: true
    })
  }

  initChart({ points, windCancellation }, positions = []) {
    const windowEndAltitude = Math.max(this.exitAltitude - windowHeight, breakoffAltitude)

    const plotLineValue = findPositionForAltitude(points, windowEndAltitude)
    const hasPositions = positions.length > 0
    const mainAxisHeight = hasPositions ? '76%' : '100%'

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
          height: mainAxisHeight,
          tickInterval: 200
        },
        {
          title: {
            text: I18n.t('charts.all_data.axis.speed')
          },
          height: mainAxisHeight,
          min: 0,
          gridLineWidth: 0,
          opposite: true
        },
        {
          height: mainAxisHeight,
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
          height: mainAxisHeight,
          min: 0,
          max: 50,
          visible: false
        },
        {
          top: '80%',
          height: '20%',
          offset: 0,
          min: -90,
          max: 90,
          tickPositions: [-90, 0, 90],
          visible: hasPositions,
          title: {
            text: I18n.t('tracks.speed_pro.metrics.position')
          },
          labels: {
            format: '{value}°'
          }
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
        accuracySeries(points, windowEndAltitude),
        hasPositions && positionSeries(points, positions)
      ].filter(Boolean)
    }

    this.chartElement.chart = Highcharts.chart(this.chartElement, chartOptions)
  }
}
