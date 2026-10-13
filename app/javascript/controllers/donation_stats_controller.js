import { Controller } from '@hotwired/stimulus'
import { formatMonthYear } from 'utils/date'
import CategoryChart from 'charts/CategoryChart'

const PEOPLE_COLOR = '#2caffe'
const AMOUNT_COLOR = '#544fc5'

export default class extends Controller {
  static targets = ['chart', 'data']
  static values = { peopleLabel: String, amountLabel: String }

  connect() {
    const data = JSON.parse(this.dataTarget.textContent)

    this.chart = new CategoryChart(this.chartTarget, {
      categories: data.map(donation => formatMonthYear(new Date(donation.month))),
      series: [
        {
          name: this.peopleLabelValue,
          type: 'line',
          color: PEOPLE_COLOR,
          values: data.map(point => point.peopleCount)
        },
        {
          name: this.amountLabelValue,
          type: 'line',
          color: AMOUNT_COLOR,
          values: data.map(point => point.amount)
        }
      ]
    })
  }

  disconnect() {
    this.chart?.destroy()
  }
}
