import { Controller } from 'stimulus'
import format from 'date-fns/format'

export default class extends Controller {
  static targets = ['chart', 'data']

  connect() {
    this.renderChart()
  }

  renderChart() {
    const data = JSON.parse(this.dataTarget.textContent)
    this.chartTarget.highcharts = new Highcharts.Chart(
      this.chartTarget,
      this.chartOptions(data)
    )
  }

  chartOptions(data) {
    const categories = data.map(donation => format(new Date(donation.month), 'MM-yyyy'))

    return {
      chart: {
        type: 'spline',
        height: 125
      },
      title: {
        text: null
      },
      data: {
        dateFormat: 'mm-yyyy'
      },
      xAxis: {
        categories,
        crosshair: true
      },
      yAxis: [
        { title: { text: null }, visible: false },
        { title: { text: null }, visible: false }
      ],
      plotOptions: {
        series: {
          marker: {
            radius: 1
          }
        }
      },
      tooltip: {
        shared: true
      },
      legend: {
        enabled: false
      },
      series: [
        {
          name: 'People donated',
          yAxis: 0,
          data: data.map(point => point.peopleCount)
        },
        {
          name: 'Amount',
          yAxis: 1,
          data: data.map(point => point.amount)
        }
      ],
      credits: {
        enabled: false
      }
    }
  }
}
