import { Controller } from '@hotwired/stimulus'
import I18n from 'i18n'
import FlightProfileChart from 'charts/FlightProfileChart'
import { parseTerrainCsv, withExitPoint } from 'utils/terrainProfiles'

const MEASUREMENT_LINE = /^(-?\d+(?:[.,]\d+)?)[\s,;]+(-?\d+(?:[.,]\d+)?)$/

export default class extends Controller {
  static targets = [
    'publishedCheckbox',
    'publicationFields',
    'measurementsText',
    'preview',
    'csvFile',
    'importError'
  ]

  connect() {
    this.chart = new FlightProfileChart({
      profileHost: this.previewTarget,
      formatters: { profile: this.previewTooltip }
    })

    this.resizeChart = this.resizeChart.bind(this)
    window.addEventListener('resize', this.resizeChart, { passive: true })

    this.renderPreview()
  }

  disconnect() {
    window.removeEventListener('resize', this.resizeChart)
    this.chart?.destroy()
  }

  resizeChart() {
    this.chart?.resize()
  }

  renderPreview() {
    const profile = this.parseMeasurements()

    if (profile.length < 2) {
      this.chart.removeTrack('preview')
      return
    }

    this.chart.setTrack('preview', { name: '', profile })
  }

  parseMeasurements() {
    const points = this.measurementsTextTarget.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => MEASUREMENT_LINE.exec(line))
      .filter(Boolean)
      .map(([, altitude, distance]) => ({
        x: Number(distance.replace(',', '.')),
        y: Number(altitude.replace(',', '.'))
      }))
      .sort((a, b) => a.x - b.x)

    return withExitPoint(points)
  }

  openImportDialog() {
    this.csvFileTarget.click()
  }

  async importCsv(event) {
    const [file] = event.target.files
    event.target.value = ''
    if (!file) return

    const measurements = await this.readMeasurements(file)

    if (measurements.length === 0) {
      this.showImportError()
      return
    }

    this.hideImportError()
    this.measurementsTextTarget.value = measurements
      .map(({ altitude, distance }) => `${altitude} ${distance}`)
      .join('\n')
    this.renderPreview()
  }

  async readMeasurements(file) {
    try {
      return parseTerrainCsv(await file.text())
    } catch {
      return []
    }
  }

  showImportError() {
    this.importErrorTarget.textContent = I18n.t('terrain_profiles.form.import_csv_failed')
    this.importErrorTarget.classList.remove('hide')
  }

  hideImportError() {
    this.importErrorTarget.classList.add('hide')
  }

  togglePublication() {
    this.publicationFieldsTarget.classList.toggle(
      'hide',
      !this.publishedCheckboxTarget.checked
    )

    if (!this.publishedCheckboxTarget.checked) this.clearPublicationErrors()
  }

  validatePublication(event) {
    this.clearPublicationErrors()
    if (!this.publishedCheckboxTarget.checked) return

    const missing = [this.placeSelect, this.trackSelect].filter(select => !select?.value)
    if (missing.length === 0) return

    event.preventDefault()
    missing.forEach(select => this.markInvalid(select))
    this.scrollIntoView(missing[0])
  }

  clearPublicationErrors() {
    this.element
      .querySelectorAll('.hot-select-container.form-input--error')
      .forEach(container => container.classList.remove('form-input--error'))
  }

  markInvalid(select) {
    select.closest('.hot-select-container')?.classList.add('form-input--error')
  }

  scrollIntoView(select) {
    select
      .closest('.hot-select-container')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  handlePlaceChange(event) {
    const placeId = event.target.value

    this.clearPublicationErrors()
    this.clearTrackSelection()
    this.reloadTrackOptions(placeId)
  }

  clearTrackSelection() {
    const select = this.trackSelect
    if (!select) return

    select.value = ''
    select.dispatchEvent(new Event('change', { bubbles: true }))
  }

  reloadTrackOptions(placeId) {
    const frame = this.element.querySelector('turbo-frame#hot-select-track_id')
    if (!frame) return

    const src = new URL(frame.src, window.location.origin)

    if (placeId) {
      src.searchParams.set('place_id', placeId)
    } else {
      src.searchParams.delete('place_id')
    }

    frame.src = src.toString()
    frame.reload()
  }

  get placeSelect() {
    return this.element.querySelector('select[name="terrain_profile[place_id]"]')
  }

  get trackSelect() {
    return this.element.querySelector('select[name="terrain_profile[track_id]"]')
  }

  previewTooltip = sample => `
    <div class="fp-tooltip-row">
      <span>↑${Math.round(sample.y)} ${I18n.t('units.m')}
        →${Math.round(sample.x)} ${I18n.t('units.m')}</span>
    </div>
  `
}
