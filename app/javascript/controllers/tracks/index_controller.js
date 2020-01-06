import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import store from 'redux/store'
import TracksIndex from 'pages/tracks/TracksIndex'

export default class extends Controller {
  connect() {
    ReactDOM.render(
      <BrowserRouter>
        <Provider store={store}>
          <TracksIndex />
        </Provider>
      </BrowserRouter>,
      this.element
    )
  }

  disconnect() {
    ReactDOM.unmountComponentAtNode(this.element)
  }
}
