import { Controller } from 'stimulus'
import { h, render } from 'preact'
import RoundReplay from 'components/RoundReplay'

export default class extends Controller {
  connect() {
    if (this.initialized) return

    this.initialized = true
    const eventId = this.element.getAttribute('data-event-id')
    const roundId = this.element.getAttribute('data-round-id')

    render(<RoundReplay eventId={eventId} roundId={roundId} />, this.element)
  }
}
