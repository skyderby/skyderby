import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    const row = this.element.querySelector('.vc-scoreboard__row--current')
    if (!row) return

    row.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
