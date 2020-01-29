import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import store from 'redux/store'
import TracksShow from 'pages/tracks/Show'
import TracksIndex from 'pages/tracks/Index'

export default class extends Controller {
  connect() {
    ReactDOM.render(
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/tracks" component={TracksIndex} />
            <Route path="/tracks/:id" component={TracksShow} />
          </Switch>
        </BrowserRouter>
      </Provider>,
      this.element
    )
  }

  disconnect() {
    ReactDOM.unmountComponentAtNode(this.element)
  }
}
