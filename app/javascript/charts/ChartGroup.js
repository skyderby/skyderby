const TOOLTIPS_HIDE_DELAY = 200

export default class ChartGroup {
  constructor(getCharts) {
    this.getCharts = getCharts
  }

  get charts() {
    return this.getCharts().filter(Boolean)
  }

  showTime(time) {
    this.cancelHide()
    this.charts.forEach(chart => chart.showTime(time))
  }

  showIndex(index) {
    this.cancelHide()
    this.charts.forEach(chart => chart.showIndex(index))
  }

  scheduleHide() {
    this.cancelHide()
    this.hideTimer = setTimeout(
      () => this.charts.forEach(chart => chart.hideTooltip()),
      TOOLTIPS_HIDE_DELAY
    )
  }

  cancelHide() {
    clearTimeout(this.hideTimer)
  }
}
