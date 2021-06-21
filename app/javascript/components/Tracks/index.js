import React from 'react'
import { Switch, Route } from 'react-router-dom'

import TracksIndex from './TracksIndex'
import Track from './Track'

const Tracks = () => (
  <Switch>
    <Route exact path="/tracks" component={TracksIndex} />
    <Route path="/tracks/:id" component={Track} />
  </Switch>
)

export default Tracks
