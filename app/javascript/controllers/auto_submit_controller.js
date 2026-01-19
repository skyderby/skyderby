import { Controller } from '@hotwired/stimulus'
import debounce from 'lodash.debounce'

export default class AutoSubmit extends Controller {
  initialize() {
    this.submit = this.submit.bind(this)
  }

  connect() {
    const delayValue = this.element.getAttribute('data-delay')
    const delay = delayValue === null ? 150 : Number(delayValue)

    if (delay > 0) {
      this.submit = debounce(this.submit, delay)
    }
  }

  submit() {
    this.element.requestSubmit()
  }
}
