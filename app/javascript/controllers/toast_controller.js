import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    setTimeout(() => this.dismiss(), 5000)
  }

  dismiss() {
    this.element.classList.add('toast-dismissed')
    setTimeout(() => this.element.remove(), 500)
  }
}
