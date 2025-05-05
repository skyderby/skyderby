import { Controller } from '@hotwired/stimulus'

export default class ModalFormController extends Controller {
  connect() {
    this.element.addEventListener('turbo:submit-end', this.submitEnd.bind(this))
  }

  submitEnd(event) {
    if (event.target === this.element && event.detail.success) {
      this.element.dispatchEvent(new CustomEvent('form:submit-success'))
    }
  }
}
