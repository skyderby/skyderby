import { Controller } from 'stimulus'

export default class PopularityChart extends Controller {
  connect() {
    this.placeId = this.element.getAttribute('data-place-id')
    this.fetchData().then(data => this.initChart(data))
  }

  fetchData() {
    return fetch(`/places/${this.placeId}/stats`, {
      headers: { Accept: 'application/json' }
    }).then(response => response.json())
  }

  initChart(data) {
    const { popularTimes } = data

    const formatter = new Intl.DateTimeFormat(undefined, { month: 'short' })
    const categories = new Array(12).fill(undefined).map((_val, idx) => {
      const date = new Date()
      date.setMonth(idx)
      return formatter.format(date)
    })

    const chartOptions = {
      chart: {
        type: 'column',
        height: 200
      },
      title: {
        text: 'Popular times'
      },
      xAxis: {
        categories,
        crosshair: true
      },
      yAxis: [
        { title: { text: null }, visible: false },
        { title: { text: null }, visible: false },
        {
          title: { text: null },
          min: 0,
          max: 200,
          tickAmount: 4,
          labels: { enabled: false }
        }
      ],
      tooltip: {
        shared: true
      },
      plotOptions: {
        column: {
          borderRadius: 8,
          pointWidth: 16
        }
      },
      series: [
        {
          name: 'Tracks recorded',
          type: 'column',
          yAxis: 0,
          color: '#2caffe',
          data: new Array(12)
            .fill(undefined)
            .map((_val, idx) => popularTimes[String(idx + 1)].trackCount)
        },
        {
          name: 'People visited',
          type: 'column',
          yAxis: 1,
          color: '#91e8e1',
          data: new Array(12)
            .fill(undefined)
            .map((_val, idx) => popularTimes[String(idx + 1)].peopleCount)
        }
      ],
      credits: {
        enabled: false
      }
    }

    this.element.chart = Highcharts.chart(this.element, chartOptions)
  }
}
