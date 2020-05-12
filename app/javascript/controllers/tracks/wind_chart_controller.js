import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    if (this.element.getAttribute('data-ready')) return

    this.init_chart()
    this.fetch_data()

    this.element.setAttribute('data-ready', true)
  }

  init_chart() {
    this.element.highcharts = new Highcharts.Chart(this.element, this.chart_options)
    this.element.highcharts.showLoading()
  }

  fetch_data() {
    fetch(this.element.getAttribute('data-url'), {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        this.weather_data = data
        this.set_chart_data()
      })
  }

  set_chart_data() {
    this.element.highcharts.series[0].setData(this.chart_data)
    this.element.highcharts.hideLoading()
  }

  get chart_data() {
    return this.weather_data
      .filter(el => el.altitude <= 5000)
      .map(el => ({
        x: Number(el.wind_direction),
        y: Math.round(el.altitude / 100) / 10,
        altitude: Math.round(el.altitude),
        wind_speed: el.wind_speed
      }))
  }

  get chart_options() {
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
          return `<b>Altitude</b> ${this.point.options.altitude} m <br>
                 '<b>Speed:</b> ${
                   Math.round(Number(this.point.options.wind_speed) * 10) / 10
                 } m/s <br>
                 '<b>Direction:</b> ${Math.round(this.x)}°`
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
              return `${Math.round(this.point.wind_speed * 10) / 10} m/s`
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
          data: [],
          pointPlacement: 'between'
        }
      ],
      credits: false
    }
  }
}
