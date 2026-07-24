import { Controller } from '@hotwired/stimulus'
import JournalChart from 'charts/JournalChart'

const formatValue = value => {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export default class extends Controller {
  static targets = ['chart', 'plot', 'data']

  connect() {
    this.charts = []
    this.chartTargets.forEach(chart => {
      const plot = chart.querySelector('[data-journal-target="plot"]')
      const dataEl = chart.querySelector('[data-journal-target="data"]')
      if (!plot || !dataEl) return

      const data = JSON.parse(dataEl.textContent)
      const instance = new JournalChart(plot, data, { formatValue })
      instance.render()
      this.charts.push(instance)
    })

    this.onResize = this.onResize.bind(this)
    window.addEventListener('resize', this.onResize)
  }

  disconnect() {
    window.removeEventListener('resize', this.onResize)
    this.charts.forEach(chart => chart.destroy())
    this.charts = []
  }

  openTrack(event) {
    if (this.element.classList.contains('compare-active')) return

    const url = event.currentTarget.dataset.trackUrl
    if (url) Turbo.visit(url)
  }

  onResize() {
    clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(() => this.charts.forEach(chart => chart.render()), 120)
  }
}
