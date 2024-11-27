import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    this.element.addEventListener('turbo:submit-end', this.submitEnd.bind(this))
    this.element.querySelector('input[name="category[name]"]').focus()
  }

  submitEnd(event) {
    if (event.detail.success) {
      this.element.dispatchEvent(new CustomEvent('form:submit-success'))
    }
  }
}
