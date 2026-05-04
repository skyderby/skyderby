import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['seats', 'total']
  static values = { priceCents: Number }

  updateTotal() {
    const seats = parseInt(this.seatsTarget.value, 10)
    const safeSeats = Number.isNaN(seats) || seats < 1 ? 1 : seats
    const totalUsd = (safeSeats * this.priceCentsValue) / 100
    this.totalTarget.textContent = `$${totalUsd.toFixed(2)}`
  }
}
