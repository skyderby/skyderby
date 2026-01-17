import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['menu']

  initialize() {
    this.close = this.close.bind(this)
  }

  connect() {
    this.menuTarget.addEventListener('turbo:submit-end', this.close)
  }

  disconnect() {
    this.menuTarget.removeEventListener('turbo:submit-end', this.close)
  }

  close() {
    this.menuTarget.hidePopover()
  }
}
