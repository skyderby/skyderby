import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'

import GlobalStyle from 'components/GlobalStyle'
import NewTrackForm from 'components/NewTrackForm'

export default class extends Controller {
  connect() {
    const userSignedIn = this.element.hasAttribute('data-user-signed-in')

    ReactDOM.render(
      <>
        <GlobalStyle />
        <NewTrackForm loggedIn={userSignedIn} />
      </>,
      this.element
    )
  }

  disconnect() {
    ReactDOM.unmountComponentAtNode(this.element)
  }
}
