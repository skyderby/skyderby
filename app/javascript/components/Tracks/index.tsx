import React from 'react'
import { Switch, Route } from 'react-router-dom'

import TracksIndex from './TracksIndex'
import Track from './Track'

const Tracks = (): JSX.Element => (
  <Switch>
    <Route exact path="/tracks" component={TracksIndex} />
    <Route path="/tracks/:id" component={Track} />
  </Switch>
)

export default Tracks
