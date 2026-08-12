import { Controller } from '@hotwired/stimulus'

const COPIED_CLASS = 'copy-value--copied'
const COPIED_DURATION = 1500

export default class ClipboardController extends Controller {
  static values = { text: String }

  connect() {
    this.reset = this.reset.bind(this)
    document.addEventListener('turbo:before-cache', this.reset)
  }

  disconnect() {
    document.removeEventListener('turbo:before-cache', this.reset)
    this.reset()
  }

  async copy() {
    try {
      await navigator.clipboard.writeText(this.textValue)
    } catch {
      return
    }

    this.element.classList.add(COPIED_CLASS)
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => this.reset(), COPIED_DURATION)
  }

  reset() {
    clearTimeout(this.timeout)
    this.element.classList.remove(COPIED_CLASS)
  }
}
