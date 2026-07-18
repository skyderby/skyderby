import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['track']

  prev() {
    this.trackTarget.scrollBy({ left: -this.step, behavior: 'smooth' })
  }

  next() {
    this.trackTarget.scrollBy({ left: this.step, behavior: 'smooth' })
  }

  get step() {
    const card = this.trackTarget.querySelector('[data-carousel-card]')
    return card ? card.offsetWidth + 20 : 320
  }
}
