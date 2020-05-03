import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import store from 'redux/store'
import GlobalStyle from 'components/GlobalStyle'
import TracksEdit from 'pages/tracks/Edit'
import TracksShow from 'pages/tracks/Show'
import TracksIndex from 'pages/tracks/Index'
import FlightProfiles from 'pages/FlightProfiles'
import EventRoundMap from 'pages/events/RoundMap'
import EventRoundReplay from 'pages/events/RoundReplay'

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <GlobalStyle />

      <Switch>
        <Route path="/flight_profiles" component={FlightProfiles} />

        <Route exact path="/tracks" component={TracksIndex} />
        <Route path="/tracks/:id/edit" component={TracksEdit} />
        <Route path="/tracks/:id" component={TracksShow} />

        <Route path="/events/:id/rounds/:roundId/map" component={EventRoundMap} />
        <Route path="/events/:id/rounds/:roundId/replay" component={EventRoundReplay} />

        {/* Fallback route for server rendered part of the app */}
        <Route
          path="*"
          component={({ match: { url } }) => {
            window.location.href = url
            return null
          }}
        />
      </Switch>
    </BrowserRouter>
  </Provider>
)

export default App
