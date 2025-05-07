import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['chart', 'data']

  connect() {
    this.renderChart()

    this.resizeCharts = this.resizeCharts.bind(this)

    window.addEventListener('resize', this.resizeCharts, { passive: true })

    this.resizeCharts()
  }

  disconnect() {
    window.removeEventListener('resize', this.resizeCharts)
  }

  resizeCharts() {
    const chartElement = this.chartTarget

    const parent = chartElement.parentElement

    const parentBoundingRect = parent.getBoundingClientRect()
    if (!parentBoundingRect) return

    chartElement.chart.setSize(parentBoundingRect.width, parentBoundingRect.height, false)
  }

  renderChart() {
    const data = JSON.parse(this.dataTarget.textContent)
    this.prepareChartData(data)
  }

  prepareChartData(data) {
    const manufacturersData = []
    const suitsData = []

    const groupedData = data.reduce((rv, x) => {
      ;(rv[x.manufacturer_name] = rv[x.manufacturer_name] || []).push(x)
      return rv
    }, {})

    let colorIndex = 0

    for (const manufacturer in groupedData) {
      const manufacturerData = groupedData[manufacturer]
      const sum = manufacturerData.reduce((memo, x) => memo + parseFloat(x.popularity), 0)

      const color = Highcharts.getOptions().colors[colorIndex]

      manufacturersData.push({
        name: manufacturer,
        y: sum,
        color: color
      })

      const dataLength = manufacturerData.length
      for (let i = 0; i < dataLength; i++) {
        const brightness = 0.2 - i / dataLength / 5
        const suit = manufacturerData[i]

        suitsData.push({
          name: suit.name,
          y: parseFloat(suit.popularity),
          color: new Highcharts.Color(color).brighten(brightness).get()
        })
      }

      colorIndex += 1
    }

    this.createChart(manufacturersData, suitsData)
  }

  createChart(manufacturersData, suitsData) {
    const chartElement = this.chartTarget

    chartElement.chart = Highcharts.chart(chartElement, {
      chart: {
        type: 'pie',
        reflow: true
      },
      title: {
        text: 'Suits popularity among people for last year'
      },
      plotOptions: {
        pie: {
          shadow: false,
          center: ['50%', '50%']
        }
      },
      tooltip: {
        valueSuffix: '%'
      },
      credits: {
        enabled: false
      },
      series: [
        {
          name: 'Manufacturer share',
          size: '60%',
          data: manufacturersData,
          dataLabels: {
            formatter: function () {
              return this.y > 5 ? this.point.name : null
            },
            color: '#ffffff',
            distance: -30
          }
        },
        {
          name: 'Suit share',
          data: suitsData,
          size: '80%',
          innerSize: '60%',
          dataLabels: {
            formatter: function () {
              return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y + '%' : null
            }
          }
        }
      ]
    })
  }
}
