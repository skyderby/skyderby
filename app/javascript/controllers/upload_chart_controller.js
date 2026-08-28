import { Controller } from '@hotwired/stimulus'

const EDGE_PADDING = 4

export default class extends Controller {
  static targets = ['scroll']

  connect() {
    this.scrollTarget.scrollLeft = this.scrollTarget.scrollWidth
  }

  place({ currentTarget }) {
    const tip = currentTarget.querySelector('[data-upload-chart-target="tip"]')
    if (!tip) return

    tip.style.setProperty('--tip-shift', '0px')

    const bounds = this.scrollTarget.getBoundingClientRect()
    const rect = tip.getBoundingClientRect()
    if (rect.width === 0) return

    let shift = 0
    if (rect.left < bounds.left + EDGE_PADDING) {
      shift = bounds.left + EDGE_PADDING - rect.left
    } else if (rect.right > bounds.right - EDGE_PADDING) {
      shift = bounds.right - EDGE_PADDING - rect.right
    }

    tip.style.setProperty('--tip-shift', `${shift}px`)
  }
}
