import { Controller } from 'stimulus'
import { h, render } from 'preact'
import TeamsCompetition from 'components/TeamsCompetition'

export default class extends Controller {
  connect() {
    const eventId = this.element.getAttribute('data-event-id')
    render(<TeamsCompetition eventId={eventId} />, this.element)
  }
}
