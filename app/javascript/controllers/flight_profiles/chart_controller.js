import { Controller } from 'stimulus'

const TOOLTIP_HEADER = `
  <span style="font-size: 14px">{series.name}</span>
  <br/>
  <span style="font-size: 12px">{series.options.place}</span>
  <br/>
`

const TOOLTIP_POINT = `
  <span style="color: transparent">-</span><br/>
  <span style="font-size: 16px">↓{point.y} →{point.x}</span><br/>
  <span style="color: transparent">-</span><br/>
  <span><b>Ground speed:</b> {point.h_speed} ${I18n.t('units.kmh')}</span><br/>
  <span><b>Vertical speed:</b> {point.v_speed} ${I18n.t('units.kmh')}</span><br/>
`

export default class extends Controller {
  connect() {
    this.chart = new Highcharts.Chart(this.chart_options)
  }

  addTrack(opts) {
    const { trackId, name, place, flightProfile } = opts

    this.chart.addSeries({
      id: `track-${trackId}`,
      name: name,
      place: place,
      data: flightProfile,
      tooltip: {
        headerFormat: TOOLTIP_HEADER,
        pointFormat: TOOLTIP_POINT
      }
    })
  }

  removeTrack(id) {
    const series = this.chart.get(`track-${id}`)
    if (!series) return

    series.remove()
  }

  showJumpProfile(name, data) {
    this.removeJumpProfile()

    this.chart.addSeries({
      name: name,
      id: 'place_measurements_line',
      type: 'spline',
      color: '#B88E8D',
      data: data,
      tooltip: {
        headerFormat: TOOLTIP_HEADER,
        pointFormat: '<span style="font-size: 16px">↓{point.y} →{point.x}</span><br/>'
      }
    })

    this.chart.addSeries({
      id: 'place_measurements_area',
      type: 'areasplinerange',
      color: '#B88E8D',
      data: data,
      enableMouseTracking: false,
      showInLegend: false
    })
  }

  removeJumpProfile() {
    for (let series_id of ['place_measurements_line', 'place_measurements_area']) {
      const series = this.chart.get(series_id)
      if (!series) continue

      series.remove()
    }
  }

  get chart_options() {
    return {
      chart: {
        renderTo: this.element,
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
          }
        }
      },
      xAxis: {
        title: {
          text: 'Distance from exit'
        },
        opposite: true,
        gridLineWidth: 1,
        tickInterval: 100,
        min: 0,
        events: {
          setExtremes: function (event) {
            this.chart.yAxis[0].setExtremes(event.min, event.max, true)
          }
        }
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
