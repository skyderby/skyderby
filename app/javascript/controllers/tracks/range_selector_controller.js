import { Controller } from '@hotwired/stimulus'
import RangeSlider from 'RangeSlider'
import { readParam, updateParams } from 'utils/urlState'

export default class extends Controller {
  static targets = ['slider', 'shortcut']
  static values = { step: { type: Number, default: 50 } }

  connect() {
    document.addEventListener(
      'turbo:before-cache',
      () => {
        this.slider?.remove()
        this.slider = null
      },
      { once: true }
    )
  }

  init({ max, min, defaultFrom = max, defaultTo = min }) {
    this.max = max
    this.min = min

    const fromParam = readParam('f')
    const toParam = readParam('t')
    let from = fromParam ? Number(fromParam) : defaultFrom
    let to = toParam ? Number(toParam) : defaultTo

    if (from > max) from = max
    if (to < min || to >= from) to = min

    this.from = from
    this.to = to

    if (this.hasSliderTarget) this.buildSlider()
    this.showShortcuts()

    return { from, to }
  }

  buildSlider() {
    this.slider?.remove()
    this.slider = new RangeSlider(this.sliderTarget, {
      type: 'double',
      step: 1,
      prettify: false,
      hasGrid: true,
      min: this.max,
      max: this.min,
      from: this.from,
      to: this.to,
      onFinish: numbers => {
        const from = this.snap(numbers.fromNumber)
        const to = this.snap(numbers.toNumber)

        if (from !== numbers.fromNumber || to !== numbers.toNumber) {
          this.slider.update({ from, to })
        }

        this.apply(from, to)
      }
    })
  }

  showShortcuts() {
    this.shortcutTargets.forEach(button => {
      const from = Number(button.dataset.from)
      const to = Number(button.dataset.to)
      button.classList.toggle('hidden', !(this.max > from && this.min < to))
    })
  }

  snap(value) {
    return Math.round(value / this.stepValue) * this.stepValue
  }

  setRange(event) {
    const { from, to, straightLine } = event.currentTarget.dataset
    this.slider?.update({ from: Number(from), to: Number(to) })
    this.apply(Number(from), Number(to), { straightLine: straightLine === 'true' })
  }

  reset() {
    this.slider?.update({ from: this.max, to: this.min })
    this.from = this.max
    this.to = this.min
    updateParams({ f: null, t: null })
    this.dispatch('change', { detail: { range: [this.max, this.min], reset: true } })
  }

  apply(from, to, { straightLine = false } = {}) {
    this.from = from
    this.to = to
    updateParams({ f: from, t: to })
    this.dispatch('change', { detail: { range: [from, to], straightLine } })
  }
}
