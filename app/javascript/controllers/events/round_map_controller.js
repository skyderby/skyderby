import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from 'redux/store'

import RoundMap from 'components/RoundMap'

export default class extends Controller {
  connect() {
    const eventId = this.element.getAttribute('data-event-id')
    const roundId = this.element.getAttribute('data-round-id')

    ReactDOM.render(
      <Provider store={store}>
        <RoundMap eventId={eventId} roundId={roundId} />
      </Provider>,
      this.element
    )
  }
}
