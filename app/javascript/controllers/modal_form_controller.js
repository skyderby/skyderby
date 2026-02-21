import { Controller } from '@hotwired/stimulus'

export default class ModalFormController extends Controller {
  static targets = ['keepAdding']

  connect() {
    this.element.addEventListener('turbo:submit-end', this.submitEnd.bind(this))
  }

  submitEnd(event) {
    if (event.target === this.element && event.detail.success) {
      if (this.hasKeepAddingTarget && this.keepAddingTarget.checked) return

      this.element.dispatchEvent(new CustomEvent('form:submit-success'))
    }
  }
}
