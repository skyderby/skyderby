import { Controller } from '@hotwired/stimulus'
import RangeSlider from '../RangeSlider'

export default class extends Controller {
  connect() {
    const maxValue = parseInt(this.element.dataset.maxValue)

    this.element.rangeSlider = new RangeSlider(this.element, {
      min: 0,
      max: maxValue,
      type: 'double',
      step: 1,
      prettify: false,
      hasGrid: true,
      onChange: data => {
        const event = new CustomEvent('change', {
          detail: {
            from: data.fromNumber,
            to: data.toNumber
          },
          bubbles: true
        })

        this.element.dispatchEvent(event)
      }
    })

    document.addEventListener(
      'turbo:before-cache',
      () => {
        this.element.rangeSlider?.remove()
      },
      { once: true }
    )
  }

  disconnect() {
    this.element.rangeSlider?.remove()
  }
}
