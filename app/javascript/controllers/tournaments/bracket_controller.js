import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  highlight(event) {
    const id = event.currentTarget.dataset.competitorId
    if (!id) return

    this.slotsFor(id).forEach(slot => slot.classList.add('bracket-slot--highlight'))
  }

  reset() {
    this.element
      .querySelectorAll('.bracket-slot--highlight')
      .forEach(slot => slot.classList.remove('bracket-slot--highlight'))
  }

  slotsFor(id) {
    return this.element.querySelectorAll(`[data-competitor-id="${id}"]`)
  }
}
