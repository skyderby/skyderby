import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['container', 'button']

  toggle() {
    this.containerTarget.classList.remove('is-collapsed')

    if (this.hasButtonTarget) {
      this.buttonTarget.remove()
    }
  }
}
