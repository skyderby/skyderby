import { Controller } from '@hotwired/stimulus'
import { patch } from '@rails/request.js'

export default class extends Controller {
  static targets = ['item']
  static values = { url: String, current: String }

  select(event) {
    const units = event.currentTarget.dataset.units
    if (units === this.currentValue) return

    this.currentValue = units
    this.itemTargets.forEach(item =>
      item.classList.toggle('active', item.dataset.units === units)
    )

    if (this.hasUrlValue) {
      patch(this.urlValue, { body: { charts_units: units }, responseKind: 'json' })
    }

    this.dispatch('change', { detail: { units } })
  }
}
