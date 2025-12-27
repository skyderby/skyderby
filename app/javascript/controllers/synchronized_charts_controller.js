import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['chart']

  refreshTooltip(event) {
    this.chartTargets.forEach(target => {
      this.drawTooltip(event, target.chart)
    })
  }

  drawTooltip(event, chart) {
    if (!chart || !chart.pointer) return

    const normalizedEvent = chart.pointer.normalize(event)
    const points = this.hoveredPoints(normalizedEvent, chart)

    if (points.length > 0) {
      points[0].onMouseOver()
      chart.tooltip.refresh(points)
      chart.xAxis[0].drawCrosshair(normalizedEvent, points[0])
    }
  }

  hoveredPoints(event, chart) {
    return chart.series.reduce((result, series) => {
      if (!series.visible || series.enableMouseTracking === false) return result

      const point = series.searchPoint(event, true)
      if (point) result.push(point)

      return result
    }, [])
  }
}
