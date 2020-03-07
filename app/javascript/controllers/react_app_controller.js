import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'

import App from 'components/App'

export default class extends Controller {
  connect() {
    ReactDOM.render(<App />, this.element)
  }

  disconnect() {
    ReactDOM.unmountComponentAtNode(this.element)
  }
}
