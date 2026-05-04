import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['entries', 'total']
  static values = { priceCents: Number }

  updateTotal() {
    const entries = parseInt(this.entriesTarget.value, 10)
    const safeEntries = Number.isNaN(entries) || entries < 1 ? 1 : entries
    const totalUsd = (safeEntries * this.priceCentsValue) / 100
    this.totalTarget.textContent = `$${totalUsd.toFixed(2)}`
  }
}
