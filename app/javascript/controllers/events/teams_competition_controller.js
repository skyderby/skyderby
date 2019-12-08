import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import store from 'redux/store'
import TeamStandingsPage from 'pages/events/TeamStandings'

export default class extends Controller {
  connect() {
    const eventId = this.element.getAttribute('data-event-id')
    const editable = this.element.getAttribute('data-editable') === 'true'

    ReactDOM.render(
      <Provider store={store}>
        <TeamStandingsPage eventId={eventId} editable={editable} />
      </Provider>,
      this.element
    )
  }

  disconnect() {
    ReactDOM.unmountComponentAtNode(this.element)
  }
}
