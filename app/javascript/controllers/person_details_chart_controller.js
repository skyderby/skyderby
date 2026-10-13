import { Controller } from '@hotwired/stimulus'
import CategoryChart from 'charts/CategoryChart'

const RESULT_COLOR = '#2caffe'

export default class extends Controller {
  static targets = ['chart', 'data']
  static values = { resultLabel: String }

  connect() {
    const data = JSON.parse(this.dataTarget.textContent)
    const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

    this.chart = new CategoryChart(this.chartTarget, {
      categories: data.map(([recordedAt]) => formatter.format(new Date(recordedAt))),
      series: [
        {
          name: this.resultLabelValue,
          color: RESULT_COLOR,
          values: data.map(([, result]) => result),
          format: value => String(Math.round(value * 100) / 100)
        }
      ],
      xLabels: false,
      yLabels: true
    })
  }

  disconnect() {
    this.chart?.destroy()
  }
}
