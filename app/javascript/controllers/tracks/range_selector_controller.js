import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    $(this.element).ionRangeSlider({
      min: this.min,
      max: this.max,
      type: 'double',
      step: 50,
      prettify: false,
      hasGrid: true,
      from: this.from,
      to: this.to,
      onFinish: (obj) => { $.rails.fire(obj.input[0], 'change') }
    })

    document.addEventListener(
      'turbolinks:before-cache',
      () => { $(this.element).ionRangeSlider('remove') },
      { once: true }
    )
  }

  get min() {
    return parseInt(this.element.getAttribute('data-min'))
  }

  get max() {
    return parseInt(this.element.getAttribute('data-max'))
  }

  get from() {
    return parseInt(this.element.getAttribute('data-from'))
  }

  get to() {
    return parseInt(this.element.getAttribute('data-to'))
  }
}
