import { Controller } from 'stimulus'

export default class ToggleableController extends Controller {
  toggle() {
    const className = this.element.getAttribute('data-toggle-class')
    this.element.classList.toggle(className)
  }
}
