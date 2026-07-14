import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    const active = this.element.querySelector('.page-tab-active')
    if (!active) return

    const offset = active.offsetLeft - (this.element.clientWidth - active.offsetWidth) / 2

    this.element.scrollLeft = Math.max(0, offset)
  }
}
