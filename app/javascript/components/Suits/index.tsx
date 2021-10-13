import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Overview from './Overview'
import MakeSuits from './MakeSuits'
import Show from './Show'

const Suits = (): JSX.Element => (
  <Switch>
    <Route exact path="/suits" component={Overview} />
    <Route path="/suits/make/:id" component={MakeSuits} />
    <Route path="/suits/:id" component={Show} />
  </Switch>
)

export default Suits
