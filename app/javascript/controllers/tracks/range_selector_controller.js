import { Controller } from '@hotwired/stimulus'
import RangeSlider from 'RangeSlider'

export default class extends Controller {
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
      step: 50,
      prettify: false,
      hasGrid: true,
      min: max,
      max: min,
      from,
      to,
      onFinish: numbers => {
        this.dispatchRangeChange(numbers.fromNumber, numbers.toNumber)
      }
    })
  }

  dispatchRangeChange(from, to) {
    this.dispatch('change', { detail: { range: [from, to] } })
  }

  updateSlider(from, to) {
    this.slider?.update({ from, to })
  }
}
