import { Controller } from 'stimulus'

const TOOLTIP_HEADER = '<span style="font-size: 14px">#{series.name}</span><br/>'
const TOOLTIP_POINT = `
  <span style="color: transparent">-</span><br/>
  <span style="font-size: 16px">↓{point.y} →{point.x}</span><br/>
  <span style="color: transparent">-</span><br/>
  <span><b>Ground speed:</b> {point.h_speed} ${I18n.t('units.kmh')}</span><br/>
  <span><b>Vertical speed:</b> {point.v_speed} ${I18n.t('units.kmh')}</span><br/>
`

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
      id: `track-${event.detail.track_id}`,
      name: event.detail.name,
      data: event.detail.flight_profile,
      tooltip: {
        headerFormat: TOOLTIP_HEADER,
        pointFormat: TOOLTIP_POINT
      }
    })
  }

  remove_track(event) {
    this.highchart.get(`track-${event.detail.track_id}`).remove()
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
        headerFormat: TOOLTIP_HEADER,
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
