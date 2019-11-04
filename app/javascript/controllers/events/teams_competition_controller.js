import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import TeamsCompetition from 'components/TeamsCompetition'

export default class extends Controller {
  connect() {
    const eventId = this.element.getAttribute('data-event-id')
    ReactDOM.render(<TeamsCompetition eventId={eventId} />, this.element)
  }

  disconnect() {
    ReactDOM.unmountComponentAtNode(this.element)
  }
}
