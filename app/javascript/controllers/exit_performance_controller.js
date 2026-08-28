import { Controller } from '@hotwired/stimulus'
import { get } from '@rails/request.js'
import ExitProfileChart from 'charts/ExitProfileChart'

export default class extends Controller {
  static targets = ['plot', 'data', 'series']
  static values = { measurementsUrlTemplate: String }

  connect() {
    if (!this.hasPlotTarget) return

    this.chart = new ExitProfileChart(
      this.plotTarget,
      JSON.parse(this.dataTarget.textContent)
    )
    this.chart.render()
    this.seriesTargets.forEach((element, index) => {
      const swatch = element.querySelector('.exit-performance__swatch')
      if (swatch) swatch.style.background = this.chart.colorFor(index)
    })

    this.onResize = this.onResize.bind(this)
    window.addEventListener('resize', this.onResize)
  }

  disconnect() {
    window.removeEventListener('resize', this.onResize)
    clearTimeout(this.resizeTimer)
    this.chart?.destroy()
    this.chart = null
  }

  toggleSeries(event) {
    const index = Number(event.currentTarget.dataset.seriesIndex)
    const visible = this.chart.toggle(index)
    event.currentTarget.classList.toggle('exit-performance__series--muted', !visible)
  }

  selectTerrain(event) {
    const terrainProfileId = event.target.value
    if (!terrainProfileId) return this.chart.clearTerrain()

    return get(this.measurementsUrlTemplateValue.replace('__ID__', terrainProfileId), {
      responseKind: 'json'
    })
      .then(response => response.json)
      .then(({ name, measurements }) => this.chart.setTerrain({ name, measurements }))
  }

  onResize() {
    clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(() => this.chart?.render(), 120)
  }
}
