import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    const max_value = parseInt(this.element.getAttribute('data-max-value'))

    $(this.element).ionRangeSlider({
      min: 0,
      max: max_value,
      type: 'double',
      step: 1,
      prettify: false,
      hasGrid: true,
      onChange: (object) => {
        let event = new CustomEvent('change', {
          detail: {
            from: object.fromNumber,
            to: object.toNumber
          },
          bubbles: true
        })

        this.element.dispatchEvent(event)
      }
    })

    document.addEventListener(
      'turbolinks:before-cache',
      () => { $(this.element).ionRangeSlider('remove') },
      { once: true }
    )
  }
}
