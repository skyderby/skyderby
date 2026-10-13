import { Controller } from '@hotwired/stimulus'
import { get } from '@rails/request.js'
import CategoryChart from 'charts/CategoryChart'

const TRACKS_COLOR = '#2caffe'
const PEOPLE_COLOR = '#91e8e1'
const MONTHS = Array.from({ length: 12 }, (_value, index) => index)

export default class PopularityChart extends Controller {
  static values = {
    url: String,
    title: String,
    tracksLabel: String,
    peopleLabel: String
  }

  connect() {
    this.fetchData().then(data => this.initChart(data))
  }

  disconnect() {
    this.chart?.destroy()
  }

  async fetchData() {
    const response = await get(this.urlValue, { responseKind: 'json' })
    return response.json
  }

  initChart({ popularTimes }) {
    if (!this.element.isConnected) return

    const formatter = new Intl.DateTimeFormat(undefined, { month: 'short' })
    const month = index => popularTimes[String(index + 1)]

    this.chart = new CategoryChart(this.element, {
      title: this.titleValue,
      categories: MONTHS.map(index => formatter.format(new Date(2000, index, 1))),
      series: [
        {
          name: this.tracksLabelValue,
          color: TRACKS_COLOR,
          values: MONTHS.map(index => month(index).trackCount)
        },
        {
          name: this.peopleLabelValue,
          color: PEOPLE_COLOR,
          values: MONTHS.map(index => month(index).peopleCount)
        }
      ]
    })
  }
}
