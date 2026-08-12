import { Controller } from '@hotwired/stimulus'
import { convertSpeed, speedUnitLabel } from 'utils/units'

export default class extends Controller {
  static targets = ['value', 'label', 'option']

  connect() {
    this.onMorph = this.onMorph.bind(this)
    this.element.addEventListener('turbo:morph-element', this.onMorph)
  }

  disconnect() {
    this.element.removeEventListener('turbo:morph-element', this.onMorph)
  }

  valueTargetConnected(target) {
    this.convertValue(target)
  }

  labelTargetConnected(target) {
    this.convertLabel(target)
  }

  optionTargetConnected(target) {
    this.markOption(target)
  }

  onMorph() {
    if (this.refreshPending) return

    this.refreshPending = true
    queueMicrotask(() => {
      this.refreshPending = false
      this.valueTargets.forEach(target => this.convertValue(target))
      this.labelTargets.forEach(target => this.convertLabel(target))
      this.optionTargets.forEach(target => this.markOption(target))
    })
  }

  markOption(target) {
    target.classList.toggle('active', target.dataset.units === this.units)
  }

  convertValue(target) {
    const speed = this.speedFor(target)
    if (speed === null) return

    target.textContent = speed.toFixed(this.precisionFor(target))
  }

  convertLabel(target) {
    const speed = this.speedFor(target)
    if (speed === null) return

    const value = speed.toFixed(this.precisionFor(target))
    target.dataset.result = `${value} ${speedUnitLabel(this.units)}`
  }

  speedFor(target) {
    const kmh = parseFloat(target.dataset.speedKmh)
    if (Number.isNaN(kmh)) return null

    return convertSpeed(kmh, this.units)
  }

  precisionFor(target) {
    const precision = parseInt(target.dataset.precision)
    return Number.isNaN(precision) ? 2 : precision
  }

  get units() {
    const meta = document.querySelector('meta[name="speed-skydiving-units"]')
    return meta?.content || 'metric'
  }
}
