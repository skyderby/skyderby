import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    this.current = this.element.querySelector('input[type="radio"]:checked')
  }

  toggle(event) {
    if (event.target === this.current) {
      event.target.checked = false
      this.current = null
    } else {
      this.current = event.target
    }
  }
}
