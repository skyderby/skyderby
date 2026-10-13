import LabeledController from 'controllers/labeled_controller'
import { differenceInMilliseconds } from 'utils/date'
import { fetchTrackPoints, fetchHeadPositions } from 'utils/tracks/trackData'
import { findPositionForAltitude } from 'charts'
import { buildSpeedSkydivingChart } from 'charts/timeSeriesCharts'

const breakoffAltitude = 1707 // 5600 ft
const windowHeight = 2256 // 7400 ft
const resultBandColor = 'rgba(0, 150, 0, 0.25)'
const windowEndColor = 'red'
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

export default class SpeedSkydivingChart extends LabeledController {
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

  disconnect() {
    this.chartElement.chart?.destroy()
  }

  initChart({ points, windCancellation }, positions = []) {
    const windowEndAltitude = Math.max(this.exitAltitude - windowHeight, breakoffAltitude)
    const altitude = `${windowEndAltitude.toFixed()} ${this.labels.t('units.m')}`
    const speed = `${this.result.toFixed(2)} ${this.labels.t('units.kmh')}`

    this.chartElement.chart = buildSpeedSkydivingChart(this.chartElement, points, {
      labels: this.labels,
      windCancellation,
      windowEndAltitude,
      positions,
      plotLines: [
        {
          value: findPositionForAltitude(points, windowEndAltitude),
          color: windowEndColor,
          label: this.labels.t('charts.speed_skydiving.end_of_window', { altitude }),
          labelPosition: 'bottom'
        }
      ],
      plotBands: [
        {
          from: differenceInMilliseconds(this.windowStartTime, points[0].gpsTime) / 1000,
          to: differenceInMilliseconds(this.windowEndTime, points[0].gpsTime) / 1000,
          color: resultBandColor,
          label: this.labels.t('charts.speed_skydiving.best_speed', { speed })
        }
      ]
    })
  }
}
