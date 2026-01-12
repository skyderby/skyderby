import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['chart', 'data']

  connect() {
    this.renderChart()
  }

  renderChart() {
    const data = JSON.parse(this.dataTarget.textContent)

    Highcharts.chart(this.chartTarget, {
      chart: {
        type: 'column',
        height: 200
      },
      title: {
        text: ''
      },
      xAxis: {
        type: 'datetime',
        labels: {
          enabled: false
        },
        title: {
          text: ''
        }
      },
      yAxis: {
        title: {
          text: ''
        },
        min: 0
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: true
          }
        }
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      },
      series: [{
        name: 'Result',
        data: data
      }]
    })
  }
}
