import { Controller } from '@hotwired/stimulus'
import PolarScatterChart from 'charts/PolarScatterChart'

const MAX_ALTITUDE = 5000
const POINT_COLOR = '#7cb5ec'

const round1 = value => Math.round(Number(value) * 10) / 10

export default class extends Controller {
  static targets = ['data']
  static values = {
    title: String,
    altitudeLabel: String,
    speedLabel: String,
    directionLabel: String,
    altitudeUnit: String,
    speedUnit: String
  }

  dataTargetConnected() {
    this.chart?.destroy()

    const weatherData = JSON.parse(this.dataTarget.textContent)
    this.chart = new PolarScatterChart(this.element, {
      title: this.titleValue,
      radiusMax: MAX_ALTITUDE / 1000,
      radiusFormat: value => `${value}k`,
      color: POINT_COLOR,
      points: weatherData
        .filter(item => item.altitude <= MAX_ALTITUDE)
        .map(item => ({
          angle: Number(item.windDirection),
          radius: Math.round(item.altitude / 100) / 10,
          label: `${round1(item.windSpeed)} ${this.speedUnitValue}`,
          tooltip: [
            [
              this.altitudeLabelValue,
              `${Math.round(item.altitude)} ${this.altitudeUnitValue}`
            ],
            [this.speedLabelValue, `${round1(item.windSpeed)} ${this.speedUnitValue}`],
            [this.directionLabelValue, `${Math.round(item.windDirection)}°`]
          ]
        }))
    })
  }

  disconnect() {
    this.chart?.destroy()
  }
}
