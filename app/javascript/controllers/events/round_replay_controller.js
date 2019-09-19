import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import RoundReplay from 'components/RoundReplay'

export default class extends Controller {
  connect() {
    if (this.initialized) return

    this.initialized = true
    const eventId = this.element.getAttribute('data-event-id')
    const roundId = this.element.getAttribute('data-round-id')

    ReactDOM.render(<RoundReplay eventId={eventId} roundId={roundId} />, this.element)
  }
}
