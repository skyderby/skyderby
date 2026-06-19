import { Controller } from '@hotwired/stimulus'
import RangeSlider from 'RangeSlider'

export default class extends Controller {
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

  initSlider(max, min, from, to) {
    this.slider = new RangeSlider(this.element, {
      type: 'double',
      step: 1,
      prettify: false,
      hasGrid: true,
      min: max,
      max: min,
      from,
      to,
      onFinish: numbers => {
        const from = this.snap(numbers.fromNumber)
        const to = this.snap(numbers.toNumber)

        if (from !== numbers.fromNumber || to !== numbers.toNumber) {
          this.slider.update({ from, to })
        }

        this.dispatchRangeChange(from, to)
      }
    })
  }

  snap(value) {
    return Math.round(value / this.stepValue) * this.stepValue
  }

  dispatchRangeChange(from, to) {
    this.dispatch('change', { detail: { range: [from, to] } })
  }

  updateSlider(from, to) {
    this.slider?.update({ from, to })
  }
}
