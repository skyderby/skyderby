import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'

import TranslationsProvider from 'components/TranslationsProvider'
import NewTrackForm from 'components/NewTrackForm'

export default class extends Controller {
  connect() {
    const userSignedIn = this.element.hasAttribute('data-user-signed-in')

    ReactDOM.render(
      <TranslationsProvider>
        <NewTrackForm loggedIn={userSignedIn} />
      </TranslationsProvider>,
      this.element
    )
  }

  disconnect() {
    ReactDOM.unmountComponentAtNode(this.element)
  }
}
