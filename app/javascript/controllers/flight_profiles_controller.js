import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = [ 'chart' ]

  connect() {
    this.element.addEventListener('flight-profiles:track-checked',   this.add_track.bind(this))
    this.element.addEventListener('flight-profiles:track-unchecked', this.remove_track.bind(this))
    this.element.addEventListener('flight-profiles:line-selected',   this.add_line.bind(this))
    this.element.addEventListener('flight-profiles:line-unselected', this.remove_line.bind(this))
  }

  add_track(event) {
    const chart = this.highchart

    chart.addSeries({
      name: event.detail.track_id,
      data: event.detail.flight_profile,
      tooltip: {
        headerFormat: '<span style="font-size: 14px">#{series.name}</span><br/>',
        pointFormat: '<span style="font-size: 16px">↓{point.y} →{point.x}</span><br/>'
      }
    })
  }

  remove_track(event) {
    const chart = this.highchart
    for (let series of chart.series) {
      if (series.name == event.detail.track_id) {
        series.remove()
        break
      }
    }
  }

  add_line(event) {
    this.remove_line()

    const chart = this.highchart

    chart.addSeries({
      name: event.detail.name,
      code: 'place_measurements',
      type: 'arearange',
      color: '#B88E8D',
      data: event.detail.measurements,
      tooltip: {
        headerFormat: '<span style="font-size: 14px">#{series.name}</span><br/>',
        pointFormat: '<span style="font-size: 16px">↓{point.y} →{point.x}</span><br/>'
      }
    })
  }

  remove_line(event) {
    const chart = this.highchart

    for (let series of chart.series) {
      if (series.options.code == 'place_measurements') {
        series.remove()
        break
      }
    }
  }

  get highchart() {
    if (this.chart.highchart) return this.chart.highchart

    this.chart.highchart = new Highcharts.Chart(this.chart_options)

    return this.chart.highchart
  }

  get chart() {
    return this.chartTarget
  }

  get chart_options() {
    return {
      chart: {
        renderTo: this.chart,
        type: 'spline',
        zoomType: 'x'
      },
      title: {
        text: ''
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: false
          }
        },
        series: {
          marker: {
            radius: 1
          },
        }
      },
      xAxis: {
        title: {
          text: 'Distance from exit'
        },
        opposite: true,
        gridLineWidth: 1,
        tickInterval: 100,
        min: 0
      },
      yAxis: {
        title: {
          text: 'Altitude usage'
        },
        reversed: true,
        tickInterval: 100,
        min: 0
      },
      credits: {
        enabled: false
      }
    }
  }
}
