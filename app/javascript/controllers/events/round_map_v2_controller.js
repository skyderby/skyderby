import { Controller } from 'stimulus'
import { h, render } from 'preact'
import RoundMap from 'components/RoundMap'
import { Provider } from 'react-redux'
import store from 'redux/store'

export default class extends Controller {
  connect() {
    const eventId = this.element.getAttribute('data-event-id')
    const roundId = this.element.getAttribute('data-round-id')

    render(
      <Provider store={store}>
        <RoundMap eventId={eventId} roundId={roundId} />
      </Provider>,
      this.element
    )
  }
}
