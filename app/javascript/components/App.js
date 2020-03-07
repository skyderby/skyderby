import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import store from 'redux/store'
import TracksEdit from 'pages/tracks/Edit'
import TracksShow from 'pages/tracks/Show'
import TracksIndex from 'pages/tracks/Index'

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route exact path="/tracks" component={TracksIndex} />
        <Route path="/tracks/:id/edit" component={TracksEdit} />
        <Route path="/tracks/:id" component={TracksShow} />
      </Switch>
    </BrowserRouter>
  </Provider>
)

export default App
