import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['menu']

  initialize() {
    super.initialize()
    this.hide = this.hide.bind(this)
  }

  connect() {
    document.addEventListener('click', this.hide)
  }

  disconnect() {
    document.removeEventListener('click', this.hide)
  }

  toggle() {
    this.menuTarget.classList.toggle('sd-dropdown-show')
  }

  close() {
    this.menuTarget.classList.remove('sd-dropdown-show')
  }

  hide(event) {
    if (!this.element.contains(event.target)) {
      this.close()
    }
  }
}
