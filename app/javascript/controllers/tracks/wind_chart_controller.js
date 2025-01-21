import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['data']

  connect() {
    this.initChart()
  }

  initChart() {
    this.weatherData = JSON.parse(this.dataTarget.textContent)
    this.element.highcharts = new Highcharts.Chart(this.element, this.getChartOptions())
    this.element.highcharts.reflow()
  }

  getChartData() {
    return this.weatherData
      .filter(el => el.altitude <= 5000)
      .map(el => ({
        x: Number(el.windDirection),
        y: Math.round(el.altitude / 100) / 10,
        altitude: Math.round(el.altitude),
        windSpeed: el.windSpeed
      }))
  }

  getChartOptions() {
    return {
      chart: {
        polar: true
      },
      title: {
        text: 'Winds aloft'
      },
      pane: {
        startAngle: 0,
        endAngle: 360
      },
      tooltip: {
        formatter: function () {
          const altitude = this.point.options.altitude
          const windSpeed = Math.round(Number(this.point.options.windSpeed) * 10) / 10
          const direction = Math.round(this.x)

          return `
            <b>Altitude</b> ${altitude} m <br>
            <b>Speed:</b> ${windSpeed} m/s <br>
            <b>Direction:</b> ${direction}°`
        }
      },
      xAxis: {
        tickInterval: 45,
        min: 0,
        max: 360,
        labels: {
          formatter: function () {
            return `${this.value}°`
          }
        }
      },
      yAxis: {
        min: 0,
        max: 5,
        tickInterval: 1,
        labels: {
          formatter: function () {
            return `${this.value}k`
          }
        }
      },
      plotOptions: {
        series: {
          dataLabels: {
            enabled: true,
            align: 'left',
            verticalAlign: 'middle',
            color: '#606060',
            formatter: function () {
              return `${Math.round(this.point.windSpeed * 10) / 10} m/s`
            }
          }
        },
        column: {
          pointPadding: 0,
          groupPadding: 0
        }
      },
      legend: {
        enabled: false
      },
      series: [
        {
          type: 'scatter',
          name: 'Wind speed',
          data: this.getChartData(),
          pointPlacement: 'between'
        }
      ],
      credits: false
    }
  }
}
