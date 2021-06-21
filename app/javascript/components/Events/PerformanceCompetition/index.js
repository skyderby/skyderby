import React from 'react'
import { Route, Switch } from 'react-router-dom'

import NewEvent from './NewEvent'
import Show from './Show'

const PerformanceCompetition = () => (
  <Switch>
    <Route exact path="/events/performance/new" component={NewEvent} />
    <Route path="/events/performance/:id" component={Show} />
  </Switch>
)

export default PerformanceCompetition
