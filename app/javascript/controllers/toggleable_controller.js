import { Controller } from '@hotwired/stimulus'

export default class ToggleableController extends Controller {
  toggle() {
    const className = this.element.getAttribute('data-toggle-class')
    this.element.classList.toggle(className)
  }
}
