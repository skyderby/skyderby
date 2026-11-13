import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['menu']

  connect() {
    document.addEventListener('turbo:before-cache', this.close)
  }

  disconnect() {
    document.removeEventListener('turbo:before-cache', this.close)
  }

  close = () => {
    if (this.hasMenuTarget) this.menuTarget.close()
  }

  closeOnBackdrop(event) {
    if (event.target === this.menuTarget) this.close()
  }
}
