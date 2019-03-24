import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = [ 'chart' ]

  refresh_tooltip(event) {
    this.charts.forEach( (chart) => { this.draw_tooltip(event, chart) })
  }

  draw_tooltip(event, chart) {
    if (!chart) return

    let normalized_event = chart.pointer.normalize(event)
    let points = this.hovered_points(normalized_event, chart)

    if (points.length > 0) {
      points[0].onMouseOver()
      chart.tooltip.refresh(points)
      chart.xAxis[0].drawCrosshair(normalized_event, points[0])
    }
  }

  hovered_points(event, chart) {
    return chart.series.reduce((result, series) => {
      if (!series.visible || series.enableMouseTracking === false) return result

      let point = series.searchPoint(event, true)
      if (point) result.push(point)

      return result
    }, [])
  }

  get charts() {
    if (!this._charts) {
      this._charts = this.chartTargets.map(el =>
        Highcharts.charts.find(chart => chart.renderTo === el)
      )
    }

    return this._charts
  }
}
